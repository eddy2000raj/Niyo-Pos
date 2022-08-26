import Cart from '../types/Cart';
import Order from '../types/Order';
import { PriceType } from '../types/Product';
import CartItemMapper from './CartItemMapper';

const fromOrder = (order: Order): Cart => {
  const items = order.items.map(item => CartItemMapper.fromOrderItem(item));
  const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const cart: Cart = {
    id: order.id,
    ref_id: order.ref_id,
    items: items,
    note: order.note,
    customer: order.customer || null,
    subtotal: order.subtotal,
    discount: order.discount,
    tax: order.tax,
    rounded: order.rounded,
    total: order.total,
    paid: order.paid,
    balance: order.balance,
    payments: order.payments,
    errors: {},
    quantity: quantity,
    discount_value: 0,
    discount_percentage: 0,
    discount_format: 'value',
    status: order.status,
    created_at: order.created_at,
    shipping_address: order.shipping_address,
    delivery_mode: order.delivery_mode,
    source: order.source,
    blacklist_rules: [],
    type: order.items.some(item => item.type == PriceType.WHOLESALE)
      ? PriceType.WHOLESALE
      : PriceType.RETAIL,
    mallOrder: order.mallOrder ? true : false,
    display_status: order.display_status,
    verification_code: order.verification_code || null,
    associated_rules: order.associated_rules ? order.associated_rules : null,
    modifiedAppOrder: false,
    refundPayments: order.refundPayments || [],
    order_return_reason_id: order.order_return_reason_id,
    parent_ref_id: order.parent_ref_id,
  };
  return cart;
};

export default { fromOrder };
