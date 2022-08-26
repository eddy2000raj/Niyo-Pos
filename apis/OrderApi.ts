import Api from './Api';
import interceptor from '../utils/Interceptor';
export default class OrderApi extends Api {
  fetch = async (params: {}) => {
    const url = this.getUrl('v1/orders');
    const client = this.getClient();
    interceptor(client);
    return await client.get(url, { params });
  };

  createOrUpdate = async (params: {}) => {
    const url = this.getUrl('v1/orders');
    const client = this.getClient();
    interceptor(client);
    return await client.post(url, params);
  };
}
