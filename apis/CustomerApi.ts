import Api from './Api';
import interceptor from '../utils/Interceptor';
export default class CustomerApi extends Api {
  getCustomers = async (params: {}) => {
    const url = this.getUrl('v1/customers');
    const client = this.getClient();
    interceptor(client);
    return await client.get(url, { params });
  };
}
