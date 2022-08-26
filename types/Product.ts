export enum PriceType {
  RETAIL = 'retail',
  WHOLESALE = 'wholesale',
}

export interface Price {
  id: number;
  type: PriceType;
  value: number;
  min_quantity: number;
  max_quantity: number;
  valid_till: number | null;
  min_price: number;
}

export default interface Product {
  id: string;
  group_id: string;
  name: string;
  barcode: string;
  hsn_sac_code: string;
  mrp: number;
  price: number;
  min_price: number;
  prices: Price[];
  uom: string;
  taxes: { name: string; percentage: number; flat: number }[];
  category: {
    id: string;
    name: string;
  };
  brand: {
    id: string;
    name: string;
  };
  stock: number;
  image_url: string;
  tags: { id: string; name: string }[];
  fast_sale: number;
  fast_tags: string[];
  keywords: string[];
  settings: {
    price_editable: boolean;
    wholesale: {
      enabled: boolean;
      moq: number;
    };
  };
  return_window: number;
}
