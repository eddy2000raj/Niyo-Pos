import CartItem from '../types/CartItem';
import OrderItem from '../types/OrderItem';

const fromCartItem = (cartItem: CartItem): OrderItem => {
  const orderItem: OrderItem = {
    id: cartItem.id,
    product: cartItem.product,
    mrp: cartItem.mrp,
    price: cartItem.price,
    wanted: cartItem.wanted,
    quantity: cartItem.quantity,
    subtotal: cartItem.subtotal,
    discount: cartItem.discount,
    discounts: cartItem.discounts,
    tax: cartItem.tax,
    taxes: cartItem.taxes,
    total: cartItem.total,
    status: cartItem.status,
    source: cartItem.source,
    parent_item: cartItem.parent_item,
    type: cartItem.type,
    return_due_date: cartItem.return_due_date,
  };
  return orderItem;
};

export default { fromCartItem };
