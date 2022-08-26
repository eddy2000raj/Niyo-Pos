import Provider, { Params, OperatorValues } from './Provider';
import { OrderItemSource, OrderItemStatus } from '../../../types/OrderItem';
import Cart from '../../../types/Cart';
import Toolkit from '../../Toolkit';

export default class CartProvider extends Provider {
  private cart: Cart;

  constructor(cart: Cart) {
    super();
    this.cart = cart;
  }

  getCart() {
    return this.cart;
  }

  getCartItems(params?: Params) {
    return this.cart.items.filter(item => {
      const { brand, category, tag } = params || {};
      return (
        item.source != OrderItemSource.OFFER &&
        item.status != OrderItemStatus.CANCELLED &&
        this.isValid(brand, [item.product.brand.id.toString()]) &&
        this.isValid(category, [item.product.category.id.toString()]) &&
        this.isValid(
          tag,
          item.product.tags.map(tag => tag.id.toString())
        )
      );
    });
  }

  private isValid(operator: OperatorValues, values: string[]) {
    if (operator) {
      if (
        (operator.unequal && Toolkit.isPresent(operator.unequal, values)) ||
        (operator.equal && !Toolkit.isPresent(operator.equal, values))
      ) {
        return false;
      }
    }
    return true;
  }

  medium() {
    return 'pos';
  }

  coupon() {
    return this.cart.coupon?.code;
  }

  customer() {
    return this.cart.customer?.id;
  }

  brand() {
    const ids = this.getCartItems().map(item => item.product.brand.id);
    return Toolkit.unique(ids);
  }

  category() {
    const ids = this.getCartItems().map(item => item.product.category.id);
    return Toolkit.unique(ids);
  }

  group() {
    const ids = this.getCartItems().map(item => item.product.group_id);
    return Toolkit.unique(ids);
  }

  tag() {
    let ids = [];
    this.getCartItems().forEach(item => {
      ids = ids.concat(item.product.tags.map(tag => tag.id.toString()));
    });
    return Toolkit.unique(ids);
  }

  product() {
    const ids = this.getCartItems().map(item => item.product.id);
    return Toolkit.unique(ids);
  }

  total_quantity(params: Params) {
    return this.getCartItems(params).reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  }

  total_amount(params: Params) {
    return this.getCartItems(params).reduce((sum, item) => sum + item.total, 0);
  }

  cart_quantity() {
    return this.getCartItems().reduce((sum, item) => sum + item.quantity, 0);
  }

  cart_amount() {
    return this.getCartItems().reduce((sum, item) => sum + item.total, 0);
  }
}
