import { PaymentMethod } from './Payment';

export default interface Settings {
  min_app_version: number;
  latest_app_version: number;
  receipt_number: number;
  invoice_format: string;
  payment_methods: PaymentMethod[];
  customer_validation: number;
  wholesaling: boolean;
  max_quantity_line_item?: number;
}
