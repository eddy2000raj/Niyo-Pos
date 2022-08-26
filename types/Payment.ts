export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  WALLET = 'wallet',
  UPI = 'upi',
  ONLINE = 'online',
  POINTS = 'points',
}

export default interface Payment {
  method: PaymentMethod;
  value: number;
}

export const RestrictedMethods = [PaymentMethod.ONLINE, PaymentMethod.POINTS];
