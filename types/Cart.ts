import CartItem from './CartItem';
import Customer from './Customer';
import Payment from './Payment';
import * as yup from 'yup';
import Coupon from './Coupon';
import Settings from './Settings';
import Order, { OrderStatus, ShippingAddress, OrderSource } from './Order';
import { PriceType } from './Product';
import Rule from './Rule';

export interface CartExtras {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paid: number;
  balance: number;
  rounded: number;
  errors: { [props: string]: any };
  associated_rules?: Rule[];
}

export default interface Cart extends CartExtras {
  id: string;
  ref_id?: string;
  items: CartItem[];
  note: string;
  quantity: number;
  customer?: Customer;
  discount_value: number;
  discount_percentage: number;
  discount_format: 'value' | 'percentage';
  payments: Payment[];
  status: OrderStatus;
  created_at?: number;
  parked_at?: number;
  shipping_address?: ShippingAddress;
  delivery_mode?: string;
  source: OrderSource;
  coupon?: Coupon;
  blacklist_rules: string[];
  type: PriceType;
  mallOrder: Boolean;
  display_status?: string;
  verification_code?: string;
  modifiedAppOrder?: boolean;
  min_cart_price?: number;
  order?: Order;
  refundPayments?: Payment[];
  maxDiscountValue?: number;
  maxDiscountPercentage?: number;
  order_return_reason_id?: number;
  parent_ref_id?: string;
}

export const CartSchema = yup.object().shape({
  quantity: yup.number().required(),
  note: yup.string().nullable(),
  discount_percentage: yup.number().max(100),
  discount: yup
    .number()
    .test('valid-discount', 'Invalid Cart Discount', function (value) {
      //TODO: improve validation logic in case of mix items in cart
      if (this.parent.total < 0) return true;
      return value <= this.parent.discount + this.parent.total ? true : false;
    }),
  customer: yup
    .object()
    .nullable()
    .test('required-customer', 'Customer Required', function (value) {
      const settings: Settings = (this.options.context as any).settings;
      const threshold = settings.customer_validation ?? Number.MAX_SAFE_INTEGER;
      if (this.parent.total <= threshold || value) {
        return true;
      }
      const message = `Customer is required, for order amount of above ${threshold}.`;
      return this.createError({ message });
    }),
  total: yup.number().max(45000),
});
