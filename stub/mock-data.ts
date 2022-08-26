import Customer from '../types/Customer';
import Cart from '../types/Cart';
import { Price, PriceType } from '../types/Product';
import { OrderSource, OrderStatus } from '../types/Order';
import Action, { ActionType } from '../types/Action';
import Rule, { Type } from '../types/Rule';
import Discount from '../types/Discount';
import { PaymentMethod } from '../types/Payment';

let flags = ['test'];

//with wholesaling was false
export const Mock_BlackListRule_WholeSaleDisabled_Store = {
  appState: {
    cart: {
      blacklist_rules: ['blacklist-rule-1', 'blacklist-rule-2'],
    },
    store: {
      settings: {
        wholesaling: false,
      },
    },
  },
};

export const Mock_BlackListRule_WholeSaleEnabled_Store = {
  appState: {
    cart: {
      blacklist_rules: ['blacklist-rule-1', 'blacklist-rule-2'],
    },
    store: {
      settings: {
        wholesaling: true,
      },
    },
  },
};

export const Mock_Empty_Store = {
  appState: {
    cart: {},
  },
};

export const Mock_Action: Action = {
  type: ActionType.PERCENTAGE,
  step: 1,
  quantity: 10,
  value: 100,
  stop: true,
  priority: 1,
};

export const Mock_Customer: Customer = {
  id: '111',
  first_name: 'test-firstname',
  last_name: 'test-lastname',
  email: 'test@gmail.com',
  mobile: '9876543210',
  gstin: 'gstin123',
};

export const Mock_Tax = {
  name: 'tax-name-111',
  value: 100,
  percentage: 10,
  flat: 20,
};

export const Mock_Price: Price = {
  id: 1,
  type: PriceType.RETAIL,
  value: 100,
  min_quantity: 1,
  max_quantity: 100,
  valid_till: null,
  min_price: 80,
};

export const Mock_Tag = {
  id: 'tag-id-111',
  name: 'tag-name',
};

export const Mock_freshItem: Cart = {
  id: 'test-111',
  items: [],
  note: '',
  type: PriceType.RETAIL,
  discount: 0,
  discount_value: 0,
  discount_percentage: 0,
  discount_format: 'value',
  quantity: 0,
  subtotal: 0,
  tax: 0,
  rounded: 0,
  total: 0,
  paid: 0,
  balance: 0,
  payments: [],
  source: OrderSource.POS,
  status: OrderStatus.CONFIRMED,
  blacklist_rules: [],
  errors: {},
  mallOrder: false,
  modifiedAppOrder: false,
};

export const Mock_freshItemWithDiscount: Cart = {
  id: 'test-111',
  items: [],
  note: '',
  type: PriceType.RETAIL,
  discount: 0,
  discount_value: 5,
  discount_percentage: 2,
  discount_format: 'percentage',
  quantity: 0,
  subtotal: 0,
  tax: 0,
  rounded: 0,
  total: 0,
  paid: 0,
  balance: 0,
  payments: [],
  source: OrderSource.POS,
  status: OrderStatus.CONFIRMED,
  blacklist_rules: [],
  errors: {},
  mallOrder: false,
  modifiedAppOrder: false,
};

export const Mock_Product = {
  id: 'product-111',
  group_id: 'product-group-111',
  name: 'test-product',
  barcode: 'test-barcode',
  hsn_sac_code: 'test-hsn-code',
  mrp: 100,
  price: 90,
  min_price: 80,
  prices: [Mock_Price],
  uom: 'test-uom',
  taxes: [Mock_Tax],
  category: {
    id: 'catgeory-id-111',
    name: 'test-category',
  },
  brand: {
    id: 'brand-id-111',
    name: 'test-brand',
  },
  stock: 11000,
  image_url: 'url',
  tags: [Mock_Tag],
  fast_sale: 1000,
  fast_tags: flags,
  keywords: flags,
  settings: {
    price_editable: true,
    wholesale: {
      enabled: true,
      moq: 333,
    },
  },
  return_window: 123,
};

// Discount rule -- its id is used as blacklist rule
export const Mock_DiscountRule: Rule = {
  id: 'discount-rule-id-111',
  type: Type.ORDER,
  title: 'rule-1',
  terms: 'term',
  description: '',
  attributes: {},
  position: 123123,
  stop: true,
  actions: [Mock_Action],
  start_at: 1231,
  end_at: 1235,
};

// Discount = discount + discount rule
export const Mock_Discount: Discount = {
  discount: 200,
  rule: Mock_DiscountRule,
};

export const Mock_Card_Payment = { method: PaymentMethod.CARD, value: 499 };
export const Mock_Points_Payment = { method: PaymentMethod.POINTS, value: 999 };
export const Mock_Payments = [Mock_Card_Payment];
