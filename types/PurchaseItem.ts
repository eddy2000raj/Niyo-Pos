export default interface PurchaseItem {
  mrp: string;
  price: string | number;
  product: string;
  quantity: number;
  subtotal: number;
  tax: number;
  total: number;
  variant: string;
}
