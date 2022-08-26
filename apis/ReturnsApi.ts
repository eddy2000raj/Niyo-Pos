import Api from './Api';
import interceptor from '../utils/Interceptor';
export default class ReturnsApi extends Api {
  fetch = async (params: {}) => {
    const url = this.getUrl('v1/store/returns');
    const client = this.getClient();
    interceptor(client);
    return await client.get(url, { params });
  };
}
