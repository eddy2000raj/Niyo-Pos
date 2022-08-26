import Axios, { AxiosInstance } from 'axios';
import moment from 'moment';

interface Props {
  token?: string;
  storeId?: number;
}
export default abstract class Api {
  private client: AxiosInstance;

  constructor({ token, storeId }: Props) {
    const headers = {
      Authorization: `Bearer ${token}`,
      StoreId: storeId,
      Hash: process.env.NEXT_PUBLIC_APP_HASH,
      Version: process.env.NEXT_PUBLIC_APP_VERSION,
      CurrentTimestamp: moment().unix(),
    };
    this.client = Axios.create({ headers });
  }

  protected getClient() {
    return this.client;
  }

  protected getUrl(path: string) {
    return process.env.NEXT_PUBLIC_API_ENDPOINT + path;
  }
}
