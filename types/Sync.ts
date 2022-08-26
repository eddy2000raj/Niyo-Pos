export enum SyncName {
  PRODUCT_SERVER = 'Products',
  ORDER_LOCAL = 'Local Orders',
  ORDER_SERVER = 'Server Orders',
  CUSTOMER_SERVER = 'Customers',
  RULE_SERVER = 'Rules',
  STORE = 'Store',
  USER_PROFILE = 'User Profile',
}

export enum SyncStatus {
  IN_PROGRESS = 'in_progress',
  FAILED = 'failed',
  COMPLETED = 'completed',
}

export default interface Sync {
  name: SyncName;
  status: SyncStatus;
  timestamp: number;
}
