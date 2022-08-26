import Product, { PriceType } from './Product';
import * as yup from 'yup';
import Tax from './Tax';
import Discount from './Discount';
import OrderItem, { OrderItemStatus, OrderItemSource } from './OrderItem';

export interface CartItemExtras {
  tax: number;
  total: number;
  subtotal: number;
  discount: number;
  errors: { [props: string]: any };
  taxes: Tax[];
}

export default interface CartItem extends CartItemExtras {
  id: string;
  product: Product;
  mrp: number;
  price: number;
  wanted: number;
  quantity: number;
  status: OrderItemStatus;
  source: OrderItemSource;
  parent_item?: OrderItem;
  discounts: Discount[];
  type: PriceType;
  dirty: boolean;
  return_due_date: number;
}

export const CartItemSchema = yup.object().shape({
  quantity: yup.number().required(),
});
