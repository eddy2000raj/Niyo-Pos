import interceptor from '../../utils/Interceptor';
import GatewayApi from './GatewayApi';
export default class ReportsApi extends GatewayApi {
  getIncomeData = async params => {
    const url = this.getUrl(
      `api/v1/transaction/incomes?store_id=1&from=${params.fromDate}&to=${params.toDate}`
    );
    const client = await this.getClient();
    interceptor(client);
    return await client.get(url).then(res => res.data.data);
  };
  getSalesData = async params => {
    const url = this.getUrl(
      `api/v1/transaction/incomes?store_id=1&from=${params.fromDate}&to=${params.toDate}`
    );
    const client = await this.getClient();
    return client.get(url).then(res => res.data.data);
  };
}
