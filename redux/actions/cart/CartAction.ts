import { v4 as uuidv4 } from 'uuid';
import Toolkit from '../../../utils/Toolkit';
import { OrderItemStatus, OrderItemSource } from '../../../types/OrderItem';
import { OrderStatus, OrderSource } from '../../../types/Order';
import Cart, { CartExtras, CartSchema } from '../../../types/Cart';
import { ThunkyDispatch, GetState, ThunkyAction } from '../../store';
import AppAction from '../AppAction';
import Customer from '../../../types/Customer';
import DB from '../../../utils/database/DB';
import CartProcessor from '../../../utils/brainiac/processors/CartProcessor';
import ItemAction from './ItemAction';
import CartItemProcessor from '../../../utils/brainiac/processors/CartItemProcessor';
import CartItem from '../../../types/CartItem';
import { PriceType } from '../../../types/Product';
import { PaymentMethod } from '../../../types/Payment';
import moment from 'moment';

const fresh = (): Cart => {
  return {
    id: uuidv4(),
    items: [],
    note: '',
    type: PriceType.RETAIL,
    discount: 0,
    discount_value: 0,
    discount_percentage: 0,
    discount_format: 'value',
    quantity: 0,
    subtotal: 0,
    tax: 0,
    rounded: 0,
    total: 0,
    paid: 0,
    balance: 0,
    payments: [],
    source: OrderSource.POS,
    status: OrderStatus.CONFIRMED,
    blacklist_rules: [],
    errors: {},
    mallOrder: false,
    modifiedAppOrder: false,
  };
};

const compute = (cart: Omit<Cart, keyof CartExtras>): ThunkyAction<Cart> => {
  return (dispatch: ThunkyDispatch, getState: GetState) => {
    const items = cart.items.map(item =>
      dispatch(ItemAction.build(item, cart.type))
    );
    let total = 0,
      subtotal = 0,
      tax = 0,
      discount = 0,
      quantity = 0,
      rounded = 0,
      initialTotal = 0;

    for (const item of items) {
      initialTotal += item.total;
      //computing cart based on item details when item order status is not canceled
      if (item.status != OrderItemStatus.CANCELLED) {
        //update quantity based on status pending or confirmed
        if (
          [OrderItemStatus.PENDING, OrderItemStatus.CONFIRMED].includes(
            item.status
          )
        ) {
          quantity += item.quantity;
        }
        subtotal += item.subtotal;
        tax += item.tax;
        discount += item.discount;
        total += item.total;
      }
    }
    subtotal = Toolkit.round(subtotal, 6);
    tax = Toolkit.round(tax, 6);
    discount = Toolkit.round(discount, 6);
    total = Toolkit.round(total, 6);
    rounded = Toolkit.round(total, 0) - total;
    total = total + rounded;
    const paid = cart.payments.reduce((sum, payment) => sum + payment.value, 0);
    let balance = 0;
    const isCashAndPoints =
      cart.payments.length === 1 &&
      cart.payments[0].method === PaymentMethod.POINTS;
    if (isCashAndPoints) {
      balance = Toolkit.round(
        total - total * (cart.payments[0].value / initialTotal),
        0
      );
    } else {
      balance = Toolkit.round(total - paid, 0);
    }
    return {
      ...cart,
      items,
      quantity,
      subtotal,
      tax,
      total,
      paid,
      balance,
      discount,
      rounded,
      errors: {},
    };
  };
};

const applyRules = (cart: Cart): ThunkyAction<Promise<Cart>> => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    let updatedCart = { ...cart };
    updatedCart = await CartItemProcessor.execute(updatedCart);
    updatedCart = dispatch(compute(updatedCart));
    console.log('After Item Rules Applied', updatedCart);
    updatedCart = await CartProcessor.execute(updatedCart);
    updatedCart = dispatch(compute(updatedCart));
    console.log('After Cart Rules Applied', updatedCart);
    return updatedCart;
  };
};

const applyAdditionalDiscount = (cart: Cart): ThunkyAction<Promise<Cart>> => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    let discountValue = cart.discount_value;
    let discountPercentage = cart.discount_percentage;
    if (discountValue > 0 || discountPercentage > 0) {
      const total = cart.total;
      let min_cart_price = 0;
      let max_discount = 0;
      cart.items.forEach(item => {
        if (item.source !== OrderItemSource.OFFER) {
          if (item.product.prices.length === 0) {
            min_cart_price += item.product.min_price * item.quantity;
          } else {
            const obj = ItemAction.getPriceObj(item, PriceType.RETAIL);
            min_cart_price += obj.min_price * item.quantity;
          }
          max_discount += Toolkit.calcItemDiscount(item);
        }
      });
      min_cart_price = Toolkit.round(min_cart_price, 6);
      const max_discount_percent = Toolkit.round(
        (max_discount * 100) / total,
        6
      );
      discountValue =
        discountValue > max_discount ? max_discount : discountValue;
      if (cart.discount_format == 'percentage') {
        discountValue = Toolkit.round((discountPercentage * total) / 100, 6);
      } else {
        discountPercentage = Toolkit.round((discountValue * 100) / total, 6);
      }
      discountValue =
        discountValue > max_discount ? max_discount : discountValue;
      discountPercentage =
        discountPercentage > max_discount_percent
          ? max_discount_percent
          : discountPercentage;
      const items = cart.items.map(item => {
        if (
          [OrderItemStatus.PENDING, OrderItemStatus.CONFIRMED].includes(
            item.status
          ) &&
          item.source != OrderItemSource.OFFER
        ) {
          const discount = distributeDiscount(item, cart, discountValue);
          const discounts = item.discounts;
          discounts.push({ discount, rule: null });
          return dispatch(ItemAction.build({ ...item, discounts }, cart.type));
        }
        return item;
      });
      return dispatch(
        compute({
          ...cart,
          items,
          discount_value: discountValue,
          discount_percentage: discountPercentage,
          min_cart_price: min_cart_price,
          maxDiscountValue: max_discount,
          maxDiscountPercentage: max_discount_percent,
        })
      );
    }
    return cart;
  };
};

const build = (
  cart: Omit<Cart, keyof CartExtras>
): ThunkyAction<Promise<Cart>> => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    let updatedCart: Cart;
    console.log('Building Cart', cart);
    const store = getState().appState.store;
    //cart.order is only present at the time of return
    if (cart.source == OrderSource.POS && !cart.order) {
      const priceType =
        store.settings.wholesaling && cart.customer?.settings?.wholesaling
          ? cart.type
          : PriceType.RETAIL;
      const items = cart.items
        .filter(item => item.source != OrderItemSource.OFFER)
        .map(item => {
          return {
            ...item,
            discounts: [],
            dirty: priceType == PriceType.WHOLESALE ? false : item.dirty,
          };
        });
      updatedCart = dispatch(compute({ ...cart, items, type: priceType }));
      if (
        updatedCart.items.length > 0 &&
        updatedCart.type != PriceType.WHOLESALE
      ) {
        updatedCart = await dispatch(applyRules(updatedCart));
        updatedCart = await dispatch(applyAdditionalDiscount(updatedCart));
      }
    } else {
      updatedCart = dispatch(compute({ ...cart }));
      if ((cart.source === OrderSource.CUSTOMER, cart.modifiedAppOrder)) {
        updatedCart = await dispatch(applyRules(updatedCart));
      }
    }
    updatedCart.errors = Toolkit.validate(CartSchema, updatedCart, {
      context: { settings: store.settings },
    });
    updatedCart.items.map(item => {
      if (item?.parent_item?.parent_item) {
        item.return_due_date = ItemAction.getReturnDate(
          item.parent_item.parent_item.product.return_window
        );
      } else if (item?.parent_item) {
        item.return_due_date = ItemAction.getReturnDate(
          item.parent_item.product.return_window
        );
      }
    });
    console.log('Final Cart', updatedCart);
    return updatedCart;
  };
};

const updateNote = (note: string) => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    const cart = getState().appState.cart;
    await dispatch(AppAction.replaceCart({ ...cart, note }, false));
  };
};

const updateDiscount = (discount: number, format: 'percentage' | 'value') => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    const cart = getState().appState.cart;
    const updatedCart: Cart = {
      ...cart,
      discount_format: format,
      discount_value: discount,
      discount_percentage: discount,
    };
    await dispatch(AppAction.replaceCart(updatedCart));
  };
};

const updateCustomer = (customer: Customer) => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    const rootState = getState();
    const cart = rootState.appState.cart;
    const updatedCart: Cart = { ...cart, customer };
    await dispatch(AppAction.replaceCart(updatedCart));
  };
};

const setType = (wholesaling: boolean) => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    const { cart, store } = getState().appState;
    const canWholesale =
      store.settings.wholesaling && cart.customer?.settings?.wholesaling;
    const priceType =
      canWholesale && wholesaling ? PriceType.WHOLESALE : PriceType.RETAIL;
    const updatedCart: Cart = { ...cart, type: priceType };
    await dispatch(AppAction.replaceCart(updatedCart));
  };
};

const blacklistRule = (item: CartItem) => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    if (item.source == OrderItemSource.OFFER) {
      const cart = getState().appState.cart;
      const blacklistRules = [...cart.blacklist_rules];
      item.discounts.forEach(discount => {
        if (discount.rule) {
          blacklistRules.push(discount.rule.id);
        }
      });
      const updatedCart: Cart = { ...cart, blacklist_rules: blacklistRules };
      await dispatch(AppAction.replaceCart(updatedCart));
    }
  };
};

const discard = (): ThunkyAction<Promise<any>> => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    const cart = getState().appState.cart;
    await DB.carts.delete(cart.id);
    await dispatch(AppAction.replaceCart());
  };
};

const save = (): ThunkyAction<Promise<any>> => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    const cart = getState().appState.cart;
    const dbCarts = await DB.carts.toArray();
    const parkedAt =
      dbCarts.filter(dCart => dCart.id == cart.id).length > 0
        ? cart.parked_at
        : moment().unix();
    const updatedCart = { ...cart, parked_at: parkedAt };
    await DB.carts.put(updatedCart);
  };
};

const distributeDiscount = (
  item: CartItem,
  cart: Cart,
  discountValue: number
) => {
  let max_discount_gasoil = 0;
  let max_discount_non_gasoil = 0;
  let discountLimitSum = 0;
  cart.items.forEach(item => {
    if (item.source === OrderItemSource.OFFER) return;
    const item_discount = Toolkit.calcItemDiscount(item);
    discountLimitSum += item_discount;
    if (Toolkit.isGasOilProduct(item.product.tags)) {
      max_discount_gasoil += item_discount;
    } else {
      max_discount_non_gasoil += item_discount;
    }
  });
  const gasOilGroupFactor = max_discount_gasoil / discountLimitSum;
  const nonGasOilGroupFactor = max_discount_non_gasoil / discountLimitSum;
  const gasOilProductDiscountSum = gasOilGroupFactor * discountValue;
  const nonGasOilProductDiscountSum = nonGasOilGroupFactor * discountValue;
  let itemDiscount = 0;
  if (Toolkit.isGasOilProduct(item.product.tags)) {
    const itemDiscountLimit = Toolkit.calcItemDiscount(item);
    itemDiscount =
      (itemDiscountLimit / max_discount_gasoil) * gasOilProductDiscountSum;
    itemDiscount =
      itemDiscountLimit < itemDiscount ? itemDiscountLimit : itemDiscount;
  } else {
    const itemDiscountLimit = Toolkit.calcItemDiscount(item);
    itemDiscount =
      (itemDiscountLimit / max_discount_non_gasoil) *
      nonGasOilProductDiscountSum;
    itemDiscount =
      itemDiscountLimit < itemDiscount ? itemDiscountLimit : itemDiscount;
  }
  if (isNaN(itemDiscount)) itemDiscount = 0;
  return itemDiscount;
};

const addReturnReason = (id: number) => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    const rootState = getState();
    const cart = rootState.appState.cart;
    await dispatch(
      AppAction.replaceCart({ ...cart, order_return_reason_id: id })
    );
  };
};

const addPrentRefId = (id: string) => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    const rootState = getState();
    const cart = rootState.appState.cart;
    const updatedCart = { ...cart, parent_ref_id: id };
    await dispatch(AppAction.replaceCart(updatedCart));
  };
};

export default {
  fresh,
  build,
  discard,
  save,
  blacklistRule,
  updateNote,
  updateDiscount,
  updateCustomer,
  setType,
  addReturnReason,
  addPrentRefId,
};
