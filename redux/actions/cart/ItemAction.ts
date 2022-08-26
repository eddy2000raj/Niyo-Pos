import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import AppAction from '../AppAction';
import Toolkit from '../../../utils/Toolkit';
import Order, { OrderSource } from '../../../types/Order';
import Product, { PriceType } from '../../../types/Product';
import { ThunkyDispatch, GetState, ThunkyAction } from '../../store';
import CartItem, {
  CartItemExtras,
  CartItemSchema,
} from '../../../types/CartItem';
import OrderItem, {
  OrderItemStatus,
  OrderItemSource,
} from '../../../types/OrderItem';
import DB from '../../../utils/database/DB';
import PaymentAction from './PaymentAction';
import Storage, { StorageKey } from '../../../utils/Storage';

const default_max_quantity_allowed = 10;
const freshItem = (product: Product, quantity: number): CartItem => {
  return {
    id: uuidv4(),
    product,
    wanted: quantity,
    quantity,
    mrp: product.mrp,
    price: product.price,
    status: OrderItemStatus.CONFIRMED,
    tax: 0,
    total: 0,
    subtotal: 0,
    discount: 0,
    errors: null,
    taxes: [],
    dirty: false,
    parent_item: null,
    discounts: [],
    source: OrderItemSource.POS,
    type: PriceType.RETAIL,
    return_due_date: getReturnDate(product.return_window),
  };
};

const getPriceObj = (
  item: Omit<CartItem, keyof CartItemExtras>,
  priceType: PriceType
) => {
  let price = {
    type: item.type,
    value: item.price,
    min_price: item.product.min_price,
  };
  if (
    item.source == OrderItemSource.POS &&
    item.status != OrderItemStatus.RETURNED
  ) {
    if (!item.dirty) {
      price = {
        type: PriceType.RETAIL,
        value: item.product.price,
        min_price: item.product.min_price,
      };

      //get price based on reatil type from product prices list , with price min quantity less then the item quantity
      price =
        item.product.prices?.find(
          price =>
            price.type == PriceType.RETAIL &&
            price.min_quantity <= item.quantity &&
            item.quantity <= price.max_quantity &&
            (!price.valid_till || moment().unix() < price.valid_till)
        ) ?? price;

      //get price based on wholesale , when product is in wholesale , with price min quantity less then the item quantity
      if (
        priceType == PriceType.WHOLESALE &&
        item.product.settings?.wholesale?.enabled
      ) {
        price =
          item.product.prices?.find(
            price =>
              price.type == PriceType.WHOLESALE &&
              price.min_quantity <= item.quantity &&
              item.quantity <= price.max_quantity &&
              (!price.valid_till || moment().unix() < price.valid_till)
          ) ?? price;
      }
    } else if (item.dirty && item.product.prices.length > 0) {
      const item_price = item.product.prices?.find(
        price =>
          price.type == PriceType.RETAIL &&
          price.min_quantity <= item.quantity &&
          item.quantity <= price.max_quantity &&
          (!price.valid_till || moment().unix() < price.valid_till)
      );
      if (item_price) {
        const price = JSON.parse(JSON.stringify(item_price));
        price.value = item.price;
        return price;
      }
    }
  }
  return price;
};

const build = (
  item: Omit<CartItem, keyof CartItemExtras>,
  priceType: PriceType
): ThunkyAction<CartItem> => {
  return (dispatch: ThunkyDispatch, getState: GetState) => {
    const priceObj = getPriceObj(item, priceType);
    const price = priceObj.value;
    const discount = item.discounts.reduce(
      (sum, itemRule) => sum + itemRule.discount,
      0
    );
    //calculate total based on item quantity ,price & discount
    const total = Toolkit.round(item.quantity * price - discount, 6);

    //calculate total tax percentage for item products
    const totalTaxPercentage = item.product.taxes.reduce(
      (sum, tax) => sum + tax.percentage,
      0
    );

    //calculate tax per unit based on item product taxes
    const taxPerUnit = item.product.taxes.reduce(
      (sum, tax) => sum + (tax.flat ?? 0),
      0
    );

    //calculate price without tax =(total-tpu*q)/(1+totalTaxP/100)
    const priceWithoutTax =
      (total - taxPerUnit * item.quantity) / (1 + totalTaxPercentage / 100);

    //calculating tax =total-pWt ;
    const tax = Toolkit.round(total - priceWithoutTax, 6);

    const taxes = item.product.taxes.map(productTax => {
      const flatTax = productTax.flat ?? 0;
      //tax value for each tax unit ,taxValue=(unit.flat*item.quantity+unit.percentage*pWT)/100
      const taxValue =
        flatTax * item.quantity +
        (productTax.percentage * priceWithoutTax) / 100;
      return {
        name: productTax.name,
        value: Toolkit.round(taxValue, 6),
        percentage: productTax.percentage,
        flat: flatTax,
      };
    });

    //calculayte subtotal where subtotal =total+discount-tax
    const subtotal = total - tax + discount;

    const builtItem = {
      ...item,
      mrp: item.product.mrp,
      price,
      type: priceObj.type,
      total,
      subtotal,
      tax,
      taxes,
      discount,
      errors: {},
    };
    builtItem.errors = Toolkit.validate(CartItemSchema, builtItem);
    return builtItem;
  };
};

const add = (product: Product) => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    let max_quantity_allowed = default_max_quantity_allowed;
    if (typeof window !== 'undefined') {
      const store = Storage.get(StorageKey.STORE, null);
      max_quantity_allowed =
        store?.settings?.max_quantity_line_item || default_max_quantity_allowed;
    }
    const cart = getState().appState.cart;
    let items = cart.items;
    const item = cart.items.find(
      item =>
        item.product.id === product.id &&
        item.status != OrderItemStatus.RETURNED
    );
    if (item) {
      const status =
        cart.source == OrderSource.POS
          ? OrderItemStatus.CONFIRMED
          : OrderItemStatus.PENDING;

      const quantity =
        cart.source == OrderSource.POS
          ? item.quantity + 1
          : Math.min(item.quantity + 1, item.wanted);
      if (quantity <= max_quantity_allowed) {
        const newItem = { ...item, quantity, status };
        items = [newItem, ...items.filter(itm => itm.id != item.id)];
      } else {
        dispatch(
          AppAction.pushToast({
            title: 'Error',
            description: `Can not add more than ${max_quantity_allowed} units`,
          })
        );
      }
    } else if (cart.source == OrderSource.POS) {
      //cart.order is only present at the time of return
      if (cart.order) {
        dispatch(
          AppAction.pushToast({
            title: 'Error',
            description: `Item can not be added on return items cart`,
          })
        );
      } else {
        const moq =
          cart.type == PriceType.WHOLESALE
            ? product.settings?.wholesale?.moq
            : 1;
        const quantity = moq || 1;
        const newItem = freshItem(product, quantity);
        items = [newItem, ...items];
      }
    }
    const updatedCart = { ...cart, items };
    await dispatch(AppAction.replaceCart(updatedCart));
  };
};

const addReturn = (
  order: Order,
  orderItem: OrderItem,
  quantity: number,
  price: number,
  mallOrder: Boolean = false
) => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    const cart = getState().appState.cart;
    const items = cart.items;
    const returnItem = freshItem(
      orderItem.product,
      -1 * Math.min(quantity, orderItem.quantity)
    );
    returnItem.status = OrderItemStatus.RETURNED;
    returnItem.price = price;
    returnItem.parent_item = orderItem;
    const updatedCart = {
      ...cart,
      items: [...items, returnItem],
      mallOrder,
      order,
    };
    await dispatch(AppAction.replaceCart(updatedCart));
  };
};

const update = (id: string, quantity: number, newPrice?: number) => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    let max_quantity_allowed = default_max_quantity_allowed;
    if (typeof window !== 'undefined') {
      const store = Storage.get(StorageKey.STORE, null);
      max_quantity_allowed =
        store?.settings?.max_quantity_line_item || default_max_quantity_allowed;
    }
    if (quantity > max_quantity_allowed) {
      dispatch(
        AppAction.pushToast({
          title: 'Error',
          description: `Can not add more than ${max_quantity_allowed} units`,
        })
      );
    }
    const cart = getState().appState.cart;
    const item = cart.items.find(item => item.id === id);
    const price = newPrice || item.price;
    const dirty = (cart.source == OrderSource.POS && !!newPrice) || item.dirty;
    const newItem = { ...item, quantity, price, dirty };
    if (
      [OrderItemSource.CUSTOMER, OrderItemSource.SYSTEM].includes(item.source)
    ) {
      newItem.quantity = Math.min(quantity, item.wanted);
      newItem.status = OrderItemStatus.PENDING;
      newItem.discounts = item.discounts.map(obj => {
        return {
          ...obj,
          discount: (obj.discount / item.quantity) * newItem.quantity,
        };
      });
    }
    const index = cart.items.findIndex(itm => itm.id == newItem.id);
    cart.items[index] = { ...newItem };
    await dispatch(AppAction.replaceCart(cart));
  };
};

const remove = (id: string) => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    const cart = getState().appState.cart;
    const item = cart.items.find(item => item.id === id);
    if (cart.mallOrder || item.status === OrderItemStatus.RETURNED) return;
    let items = cart.items.filter(item => item.id != id);
    let refundPayments = [];
    if (cart.source != OrderSource.POS) {
      items = [...items, { ...item, status: OrderItemStatus.CANCELLED }];
      refundPayments = PaymentAction.computePayments(items, cart.payments);
      if (cart.source === OrderSource.CUSTOMER && cart.associated_rules) {
        cart['modifiedAppOrder'] = true;
        await DB.app_order_associated_rules.clear();
        await DB.app_order_associated_rules.bulkPut(cart.associated_rules);
        items = removeAppOrderItemRules(items);
      }
    }
    let updatedCart = { ...cart, items, refundPayments };
    // Generate new cart when last item is removed so that it doesn't conflicts with parked cart
    updatedCart = items.length == 0 ? null : updatedCart;
    await dispatch(AppAction.replaceCart(updatedCart));
  };
};

const removeAppOrderItemRules = (items: CartItem[]) => {
  let itemsArray: CartItem[] = [];
  items.forEach(itm => {
    if (itm.status === OrderItemStatus.PENDING) {
      const cart_item = {
        ...itm,
        discounts: [],
        discount: 0,
        parent_item: null,
        tax: 0,
        total: 0,
        subtotal: 0,
        errors: null,
        taxes: [],
      };
      itemsArray.push(cart_item);
    } else {
      itemsArray.push(itm);
    }
  });
  return itemsArray;
};

const getReturnDate = returnWindow => {
  if (returnWindow === 0) return 0;
  else
    return moment().endOf('day').add(returnWindow, 'days').endOf('day').unix();
};

export default {
  freshItem,
  build,
  add,
  update,
  remove,
  addReturn,
  getPriceObj,
  getReturnDate,
};
