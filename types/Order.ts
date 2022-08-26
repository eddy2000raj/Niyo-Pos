import OrderItem from './OrderItem';
import Payment from './Payment';
import Customer from './Customer';
import { PriceType } from './Product';
import Rule from './Rule';

export enum OrderStatus {
  HOLD = 'hold',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
}

export const OrderStatusColor = {
  hold: 'btn-orange',
  pending: 'btn-yellow',
  confirmed: 'btn-blue-dark',
  fulfilled: 'btn-green',
  cancelled: 'btn-red',
};

export enum OrderSource {
  POS = 'pos',
  CUSTOMER = 'customer',
  SYSTEM = 'system',
}

export interface ShippingAddress {
  id: number;
  title: string;
  line_1: string;
  line_2: string;
  line_3: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

export default interface Order {
  id: string;
  type: PriceType;
  ref_id: string;
  receipt_number?: number;
  invoice_number?: string;
  gstin?: string;
  shipping_address?: ShippingAddress;
  items: OrderItem[];
  note: string;
  customer: Customer;
  subtotal: number;
  discount: number;
  tax: number;
  rounded: number;
  total: number;
  paid: number;
  balance: number;
  payments: Payment[];
  created_at: number;
  invoiced_at: number;
  synced: 0 | 1;
  status: OrderStatus;
  delivery_mode?: string;
  return_item_ids?: number[];
  source: OrderSource;
  mallOrder?: boolean;
  display_status?: string;
  verification_code?: string;
  associated_rules?: Rule[];
  modifiedAppOrder?: boolean;
  refundPayments?: Payment[];
  order_return_reason_id?: number;
  parent_ref_id?: string;
}
