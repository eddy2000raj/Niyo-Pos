import Discount from './Discount';
import Product, { PriceType } from './Product';
import Tax from './Tax';

export enum OrderItemSource {
  POS = 'pos',
  OFFER = 'offer',
  CUSTOMER = 'customer',
  SYSTEM = 'system',
}

export default interface OrderItem {
  id: string;
  product: Product;
  mrp: number;
  price: number;
  wanted: number;
  quantity: number;
  allowed_return_qty?: number;
  subtotal: number;
  discount: number;
  discounts: Discount[];
  tax: number;
  taxes: Tax[];
  total: number;
  status: OrderItemStatus;
  source: OrderItemSource;
  parent_item?: OrderItem;
  type: PriceType;
  return_due_date: number;
}

export enum OrderItemStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}
