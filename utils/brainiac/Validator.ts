import CartProvider from './providers/CartProvider';
import CartItemProvider from './providers/CartItemProvider';
import Rule, { Attribute, Attributes } from '../../types/Rule';
import Provider, { Params } from './providers/Provider';
import moment from 'moment';
import Cart from '../../types/Cart';
import { OrderSource } from '../../types/Order';

const isValid = (rule: Rule, provider: Provider) => {
  if (isActive(rule, provider)) {
    const attributes = Object.keys(rule.attributes) as Attribute[];
    for (const attribute of attributes) {
      if (!isValidExpressions(attribute, rule.attributes, provider)) {
        return false;
      }
    }
    return true;
  }
  return false;
};

const isActive = (rule: Rule, provider: Provider) => {
  if (provider instanceof CartProvider) {
    const cart: Cart = provider.getCart();
    if ((cart.source === OrderSource.CUSTOMER, cart.modifiedAppOrder))
      return true;
  }
  const current = moment().unix();
  return rule.start_at < current && (!rule.end_at || current < rule.end_at);
};

const isValidExpressions = (
  attribute: Attribute,
  attributes: Attributes,
  provider: Provider
) => {
  const operators = attributes[attribute];
  const isNumber = provider.isNumber(attribute);
  const params: Params = provider.getParams(attributes);
  if (!provider[attribute]) {
    return false;
  }
  const value = provider[attribute](params);
  const values = Array.isArray(value) ? value : [value];
  if (isNumber) {
    for (const expression of operators.equal) {
      const min = parseFloat(expression.value);
      const max = expression.max_value;
      if (min <= value && (!max || value <= parseFloat(max))) {
        return true;
      }
    }
  } else {
    let valid = true;
    const { equal, unequal } = operators;
    if (equal && equal.length > 0) {
      valid = equal.some(exp => values.includes(exp.value));
    }
    if (unequal && unequal.length > 0) {
      if (provider instanceof CartProvider) {
        const hasItemLeft = provider.getCart().items.some(item => {
          const itemProvider = new CartItemProvider(provider.getCart(), item);
          const value = itemProvider[attribute]();
          const values = Array.isArray(value) ? value : [value];
          return !unequal.some(exp => values.includes(exp.value));
        });
        valid = valid && hasItemLeft;
      } else if (provider instanceof CartItemProvider) {
        valid = valid && !unequal.some(exp => values.includes(exp.value));
      }
    }
    return valid;
  }
  return false;
};

export default { isValid };
