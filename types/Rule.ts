import Coupon from './Coupon';
import Action from './Action';

export enum Attribute {
  MEDIUM = 'medium',
  PRICE = 'price',
  QUANTITY = 'quantity',
  COUPON = 'coupon',
  PRODUCT = 'product',
  TAG = 'tag',
  BRAND = 'brand',
  CATEGORY = 'category',
  GROUP = 'group',
  TOTAL_QUANTITY = 'total_quantity',
  TOTAL_AMOUNT = 'total_amount',
  CART_QUANTITY = 'cart_quantity',
  CART_AMOUNT = 'cart_amount',
}

export enum Type {
  ORDER = 'order',
  PRODUCT = 'product',
}

export interface Expression {
  value: string;
  max_value?: string;
  operator: 'equal' | 'unequal';
}

export enum Operator {
  EQUAL = 'equal',
  UNEQUAL = 'unequal',
}

export type Operators = { [key in Operator]?: Expression[] };
export type Attributes = { [key in Attribute]?: Operators };

export default interface Rule {
  id: string;
  type: Type;
  title: string;
  terms: string;
  description: string;
  attributes: Attributes;
  position: number;
  stop: boolean;
  coupon?: Coupon;
  actions: Action[];
  start_at: number;
  end_at: number | null;
  keys?: string[];
}
