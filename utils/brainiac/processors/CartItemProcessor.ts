import DB from '../../database/DB';
import Validator from '../Validator';
import Cart from '../../../types/Cart';
import Rule from '../../../types/Rule';
import KeysBuilder from '../KeysBuilder';
import { Type } from '../../../types/Rule';
import ActionExecutor from '../ActionExecutor';
import CartProvider from '../providers/CartProvider';
import CartItemProvider from '../providers/CartItemProvider';
import { OrderSource } from '../../../types/Order';

const getRules = async (provider: CartProvider, cart: Cart) => {
  let keys = [];
  provider.getCartItems().forEach(item => {
    const itemProvider = new CartItemProvider(provider.getCart(), item);
    keys = keys.concat(KeysBuilder.fromProvider(Type.PRODUCT, itemProvider));
  });
  console.log('cart item provider keys', keys.length);
  let rules: Rule[];
  if (cart.associated_rules && cart.source === OrderSource.CUSTOMER) {
    rules = await DB.app_order_associated_rules
      .where('keys')
      .anyOf(keys)
      .sortBy('position');
  } else {
    rules = await DB.rules.where('keys').anyOf(keys).sortBy('position');
  }
  console.log('Item Matching Rules Found', rules);
  return rules;
};

const apply = (rules: Rule[], provider: CartProvider) => {
  for (const item of provider.getCartItems()) {
    const itemProvider = new CartItemProvider(provider.getCart(), item);
    for (const rule of rules) {
      if (Validator.isValid(rule, itemProvider)) {
        console.log('executing', rule);
        if (!provider.getCart().blacklist_rules.includes(rule.id)) {
          ActionExecutor.onItem(rule, itemProvider);
        }
        if (rule.stop) {
          break;
        }
      }
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
