import Api from './Api';
import interceptor from '../utils/Interceptor';

export default class DashboardApi extends Api {
  stats = async (params: {}) => {
    const url = this.getUrl('v1/dashboard/stats');
    const client = this.getClient();
    interceptor(client);
    return await client.get(url, { params });
  };
}
