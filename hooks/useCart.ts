import { useSelector } from 'react-redux';
import { RootState, useThunkyDispatch } from '../redux/store';
import Product from '../types/Product';
import { PaymentMethod } from '../types/Payment';
import Customer from '../types/Customer';
import OrderAction from '../redux/actions/OrderAction';
import Order from '../types/Order';
import CartMapper from '../mappers/CartMapper';
import OrderItem from '../types/OrderItem';
import ItemAction from '../redux/actions/cart/ItemAction';
import CartAction from '../redux/actions/cart/CartAction';
import AppAction from '../redux/actions/AppAction';
import PaymentAction from '../redux/actions/cart/PaymentAction';
import CartItem from '../types/CartItem';
import moment from 'moment';
import DB from '../utils/database/DB';

const mapRootState = (rootState: RootState) => {
  return { cart: rootState.appState.cart, store: rootState.appState.store };
};

const useCart = () => {
  const { cart, store } = useSelector(mapRootState);
  const dispatch = useThunkyDispatch();

  const addItem = async (product: Product) => dispatch(ItemAction.add(product));
  const removeItem = async (id: string) => dispatch(ItemAction.remove(id));

  const updateItem = async (id: string, quantity: number, price: number) => {
    await dispatch(ItemAction.update(id, quantity, price));
  };

  const updateItemQuantity = async (id: string, quantity: number) => {
    dispatch(ItemAction.update(id, quantity));
  };

  const updateNote = async (note: string) =>
    dispatch(CartAction.updateNote(note));

  const updateDiscount = async (
    discount: number,
    format: 'value' | 'percentage'
  ) => {
    await dispatch(CartAction.updateDiscount(discount, format));
  };
  const updateCustomer = async (customer: Customer) =>
    dispatch(CartAction.updateCustomer(customer));

  const addPayment = async (method: PaymentMethod, value: number) =>
    dispatch(PaymentAction.add(method, value));
  const addPayments = async () => dispatch(PaymentAction.addRefundPayment());
  const collectRefundPayment = async () =>
    dispatch(PaymentAction.collectRefundPayments());
  const removePayment = async (method: PaymentMethod, value: number) =>
    dispatch(PaymentAction.remove(method, value));
  const resetPayments = async () => await dispatch(PaymentAction.reset());

  const discard = async () => await dispatch(CartAction.discard());
  const park = async () => {
    await dispatch(CartAction.save());
    await dispatch(AppAction.replaceCart());
  };

  const complete = async (): Promise<Order> => {
    const order: Order = (await dispatch(OrderAction.create(cart))) as any;
    await dispatch(AppAction.replaceCart());
    return order;
  };

  const addReturnItem = async (
    order: Order,
    orderItem: OrderItem,
    quantity: number,
    price: number,
    mallOrder: Boolean = false
  ) => {
    await dispatch(
      ItemAction.addReturn(order, orderItem, quantity, price, mallOrder)
    );
  };

  const addReturnReason = async (reasonId: number) => {
    await dispatch(CartAction.addReturnReason(reasonId));
  };

  const addPrentRefId = async (refId: string) => {
    await dispatch(CartAction.addPrentRefId(refId));
  };

  const loadOrder = async (order: Order) => {
    const cart = CartMapper.fromOrder(order);
    const refundPayments = PaymentAction.computePayments(
      cart.items,
      cart.payments
    );
    await dispatch(AppAction.replaceCart({ ...cart, refundPayments }));
  };

  const markConfirmed = async () => {
    const order: Order = (await dispatch(OrderAction.confirm(cart))) as any;
    await loadOrder(order);
  };

  const blacklistRule = async (item: CartItem) => {
    await dispatch(CartAction.blacklistRule(item));
  };

  const canWholesale = () => {
    return store.settings.wholesaling && cart.customer?.settings?.wholesaling;
  };

  const setType = async (wholesaling: boolean) => {
    await dispatch(CartAction.setType(wholesaling));
  };

  const deleteExpiredParkedSales = async () => {
    let cartsToDelete = [];
    const parkedSales = await DB.carts.toArray();
    const expiredParkedSales = parkedSales.filter(
      sale => Math.abs(moment().diff(moment.unix(sale.parked_at), 'hours')) > 48
    );
    expiredParkedSales.map(sale => cartsToDelete.push(sale.id));
    await DB.carts.bulkDelete(cartsToDelete);
  };

  return {
    cart,
    addItem,
    removeItem,
    updateItem,
    updateItemQuantity,
    updateNote,
    updateDiscount,
    updateCustomer,
    blacklistRule,
    addReturnItem,
    loadOrder,
    markConfirmed,
    addPayment,
    removePayment,
    resetPayments,
    discard,
    park,
    complete,
    canWholesale,
    setType,
    addPayments,
    collectRefundPayment,
    addReturnReason,
    addPrentRefId,
    deleteExpiredParkedSales,
  };
};

export default useCart;
