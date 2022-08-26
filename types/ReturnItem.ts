import PurchaseItem from './PurchaseItem';

export default interface ReturnItem {
  created_at: number;
  document_number?: number;
  id: number;
  items: PurchaseItem[];
  status: string;
  total?: number;
}
