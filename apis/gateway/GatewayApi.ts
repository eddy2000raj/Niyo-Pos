import Axios, { AxiosInstance } from 'axios';
import Storage, { StorageKey } from '../../utils/Storage';

interface Props {
  token?: string;
  storeId?: number;
}

export default abstract class GatewayApi {
  private client: AxiosInstance;

  constructor(token: Props) {
    const headers = {
      Authorization: `Bearer ${Storage.get(StorageKey.TOKEN_GATEWAY, null)}`,
      Hash: process.env.NEXT_PUBLIC_APP_HASH,
      Version: process.env.NEXT_PUBLIC_APP_VERSION,
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Expires: '0',
    };
    this.client = Axios.create({ headers });
  }

  protected getClient() {
    return this.client;
  }

  protected getUrl(path: string) {
    return process.env.NEXT_PUBLIC_API_ENDPOINT_GATEWAY + path;
  }
}
