import Product from './Product';

export enum ActionType {
  PERCENTAGE = 'percentage',
  FLAT = 'flat',
  FLAT_PER_ITEM = 'flat_per_item',
  FREE = 'free',
  NEW_PRICE = 'new_price',
}

export default interface Action {
  type: ActionType;
  step: number;
  quantity: number;
  value: number;
  product?: Product;
  max?: number;
  stop: boolean;
  priority: number;
}
