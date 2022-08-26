import Store from './Store';
export default interface User {
  id: number;
  name: string;
  email: string;
  status: boolean;
  store: Store;
}
