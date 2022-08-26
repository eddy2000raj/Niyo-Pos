import { v4 as uuidv4 } from 'uuid';
import CartItem from '../../types/CartItem';
import Discount from '../../types/Discount';
import CartProvider from './providers/CartProvider';
import Rule from '../../types/Rule';
import CartItemProvider from './providers/CartItemProvider';
import { OrderItemSource, OrderItemStatus } from '../../types/OrderItem';
import Action, { ActionType } from '../../types/Action';
import { PriceType } from '../../types/Product';

const getDiscount = (action: Action, price: number, quantity: number) => {
  let discount = 0;
  let discountQuantity = quantity - (quantity % action.step);
  switch (action.type) {
    case ActionType.PERCENTAGE:
      discount = ((action.value * price) / 100) * discountQuantity;
      break;

    case ActionType.FLAT:
      discount =
        ((quantity - (quantity % action.step)) / action.step) * action.value;

      break;

    case ActionType.FLAT_PER_ITEM:
      discount = action.value * discountQuantity;
      break;

    case ActionType.NEW_PRICE:
      discountQuantity = Math.min(
        discountQuantity,
        action.max ?? Number.MAX_SAFE_INTEGER
      );
      discount = (price - action.value) * discountQuantity;
      break;
  }
  if (action.type != ActionType.NEW_PRICE) {
    discount = Math.min(discount, action.max || Number.MAX_SAFE_INTEGER);
  }
  discount = Math.max(0, discount);
  return discount;
};

const getFreeItem = (
  rule: Rule,
  action: Action,
  totalQuantity: number,
  parent?: CartItem
): CartItem => {
  let freeQuantity = Math.floor(totalQuantity / action.step) * action.quantity;
  freeQuantity = Math.min(freeQuantity, action.max || Number.MAX_SAFE_INTEGER);
  if (freeQuantity > 0) {
    const product = action.product || parent.product;
    const discount: Discount = { discount: 0, rule };
    return {
      id: uuidv4(),
      product,
      wanted: freeQuantity,
      quantity: freeQuantity,
      mrp: product.mrp,
      price: action.value,
      status: OrderItemStatus.CONFIRMED,
      parent_item: parent,
      discounts: [discount],
      source: OrderItemSource.OFFER,
      dirty: false,
      tax: 0,
      total: 0,
      subtotal: 0,
      discount: 0,
      taxes: [],
      errors: {},
      type: PriceType.RETAIL,
      return_due_date: parent.return_due_date,
    };
  }
  return null;
};

const onCart = (rule: Rule, provider: CartProvider) => {
  const cart = provider.getCart();
  const params = provider.getParams(rule.attributes);
  for (const action of rule.actions) {
    if (action.type == ActionType.FREE) {
      const freeItem = getFreeItem(rule, action, 1);
      if (freeItem && freeItem.product.stock > 0) {
        cart.items.push(freeItem);
        if (action.stop) {
          break;
        }
      }
    } else {
      const total = provider.total_amount(params);
      const discount = getDiscount(action, total, 1);
      provider.getCartItems(params).forEach(item => {
        if (item.source != OrderItemSource.OFFER) {
          const itemDiscount = (item.total / total) * discount;
          item.discounts.push({ discount: itemDiscount, rule });
        }
        return item;
      });
      if (action.stop) {
        break;
      }
    }
  }
};

const onItem = (rule: Rule, provider: CartItemProvider) => {
  const cart = provider.getCart();
  const item = provider.getItem();
  let free_item = null;
  let flag = -1;
  for (const action of rule.actions) {
    if (action.type === ActionType.FREE) {
      ++flag;
      const freeItem = getFreeItem(rule, action, item.quantity, item);
      if (flag === 0) free_item = freeItem;
      if (freeItem) {
        if (freeItem.product.stock > free_item.product.stock) {
          free_item = freeItem;
        }
        if (rule.actions.length - 1 === flag) {
          if (free_item.product.stock > 0) {
            cart.items.push(free_item);
          }
          if (action.stop) {
            break;
          }
        }
      }
    } else {
      const discount = getDiscount(action, item.price, item.quantity);
      item.discounts.push({ discount, rule });
      if (action.stop) {
        break;
      }
    }
  }
};

export default { onCart, onItem };
