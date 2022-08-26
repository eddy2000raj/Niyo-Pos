import Api from './Api';
import interceptor from '../utils/Interceptor';

export default class InfoApi extends Api {
  getAll = async (params: {}) => {
    const url = this.getUrl('v1/info-tab');
    const client = this.getClient();
    interceptor(client);
    return await client.get(url, { params });
  };
}
