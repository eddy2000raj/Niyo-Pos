import moment from 'moment';
import Cart from '../types/Cart';
import Order from '../types/Order';
import OrderItemMapper from './OrderItemMapper';

const fromCart = (cart: Cart): Order => {
  const order: Order = {
    id: cart.id,
    type: cart.type,
    ref_id: cart.ref_id,
    receipt_number: null,
    invoice_number: null,
    //TODO:: check if any condition is need for adding customer gstin to order
    gstin: cart.customer?.gstin,
    items: cart.items.map(item => OrderItemMapper.fromCartItem(item)),
    note: cart.note,
    customer: cart.customer || null,
    subtotal: cart.subtotal,
    discount: cart.discount,
    tax: cart.tax,
    rounded: cart.rounded,
    total: cart.total,
    paid: cart.paid,
    balance: cart.balance,
    payments: cart.payments,
    created_at: cart.created_at ? cart.created_at : moment().unix(), //TODO: Decided what to do with this if anything needs to be done
    invoiced_at: moment().unix(),
    synced: 0,
    status: cart.status,
    shipping_address: cart.shipping_address,
    delivery_mode: cart.delivery_mode,
    source: cart.source,
    mallOrder: cart.mallOrder ? true : false,
    display_status: cart.display_status,
    verification_code: cart.verification_code || null,
    refundPayments: cart.refundPayments || [],
    order_return_reason_id: cart.order_return_reason_id,
    parent_ref_id: cart.parent_ref_id,
  };
  return order;
};

export default { fromCart };
