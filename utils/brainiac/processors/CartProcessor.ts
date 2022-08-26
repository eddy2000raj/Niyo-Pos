import DB from '../../database/DB';
import Validator from '../Validator';
import Cart from '../../../types/Cart';
import Rule from '../../../types/Rule';
import KeysBuilder from '../KeysBuilder';
import { Type } from '../../../types/Rule';
import provider from '../providers/Provider';
import ActionExecutor from '../ActionExecutor';
import CartProvider from '../providers/CartProvider';
import { OrderSource } from '../../../types/Order';

const getRules = async (provider: provider, cart: Cart) => {
  const keys = KeysBuilder.fromProvider(Type.ORDER, provider);
  console.log('cart provider keys', keys.length);
  let rules: Rule[];
  if (cart.associated_rules && cart.source === OrderSource.CUSTOMER) {
    rules = await DB.app_order_associated_rules
      .where('keys')
      .anyOf(keys)
      .and(rule => Validator.isValid(rule, provider))
      .sortBy('position');
  } else {
    rules = await DB.rules
      .where('keys')
      .anyOf(keys)
      .and(rule => Validator.isValid(rule, provider))
      .sortBy('position');
  }
  console.log('Cart Matching Rules Found', rules);
  return rules;
};

const apply = (rules: Rule[], provider: CartProvider) => {
  for (const rule of rules) {
    console.log('executing', rule);
    if (!provider.getCart().blacklist_rules.includes(rule.id)) {
      ActionExecutor.onCart(rule, provider);
    }
    if (rule.stop) {
      break;
    }
  }
};

const execute = async (cart: Cart): Promise<Cart> => {
  const provider = new CartProvider(cart);
  const rules = await getRules(provider, cart);
  apply(rules, provider);
  return provider.getCart();
};

export default { execute };
