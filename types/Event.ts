export enum Event {
  PARKSALE = 'parksale_userclick',
  SYNC = 'sync_userclick',
  PRINT_RECEIPT = 'print_receipt',
  PRINT_RECEIPT_FROM_ORDER_PAGE = 'print_receipt_from_order_page',
}

export interface EventParamsOptional {
  order_id?: string;
}

export interface EventParams extends EventParamsOptional {
  store: number;
  name: string;
  triggered_at: string;
  latitude: string;
  longitude: string;
}
