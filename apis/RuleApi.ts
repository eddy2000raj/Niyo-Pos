import Api from './Api';
import interceptor from '../utils/Interceptor';
export default class RuleApi extends Api {
  fetch = async (params: {}) => {
    const url = this.getUrl('v1/rules');
    const client = this.getClient();
    interceptor(client);
    return await client.get(url, { params });
  };
}
