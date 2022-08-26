import OrderItem from '../types/OrderItem';
import CartItem from '../types/CartItem';
import ItemAction from '../redux/actions/cart/ItemAction';

const fromOrderItem = (orderItem: OrderItem): CartItem => {
  const cartItem: CartItem = {
    id: orderItem.id,
    product: orderItem.product,
    mrp: orderItem.mrp,
    price: orderItem.price,
    wanted: orderItem.wanted,
    quantity: orderItem.quantity,
    subtotal: orderItem.subtotal,
    discount: orderItem.discount,
    discounts: orderItem.discounts,
    tax: orderItem.tax,
    taxes: orderItem.taxes,
    total: orderItem.total,
    status: orderItem.status,
    parent_item: orderItem.parent_item,
    errors: {},
    source: orderItem.source,
    type: orderItem.type,
    dirty: false,
    return_due_date: ItemAction.getReturnDate(orderItem.product.return_window),
  };
  return cartItem;
};

export default { fromOrderItem };
