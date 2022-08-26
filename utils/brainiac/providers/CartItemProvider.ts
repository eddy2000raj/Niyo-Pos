import Provider from './Provider';
import Cart from '../../../types/Cart';
import CartItem from '../../../types/CartItem';

export default class CartItemProvider extends Provider {
  private cart: Cart;
  private item: CartItem;

  constructor(cart: Cart, item: CartItem) {
    super();
    this.cart = cart;
    this.item = item;
  }

  getCart() {
    return this.cart;
  }

  getItem() {
    return this.item;
  }

  medium() {
    return 'pos';
  }

  coupon() {
    return this.cart.coupon?.code?.toString();
  }

  customer() {
    return this.cart.customer?.id?.toString();
  }

  brand() {
    return this.item.product.brand.id.toString();
  }

  category() {
    return this.item.product.category.id.toString();
  }

  group() {
    return this.item.product.group_id.toString();
  }

  tag() {
    return this.item.product.tags.map(tag => tag.id.toString());
  }

  product() {
    return this.item.product.id.toString();
  }

  total_quantity() {
    return this.cart.quantity;
  }

  total_amount() {
    return this.cart.total;
  }

  cart_quantity() {
    return this.cart.quantity;
  }

  cart_amount() {
    return this.cart.total;
  }
}
