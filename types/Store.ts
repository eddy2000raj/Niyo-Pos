import Settings from './Settings';

export default interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
  gstin: string;
  mobile: string;
  pincode: string;
  state: string;
  settings: Settings;
  fssai_license: string;
}
