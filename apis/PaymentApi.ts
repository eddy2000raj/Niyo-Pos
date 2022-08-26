import Api from './Api';
import qs from 'qs';
import interceptor from '../utils/Interceptor';
export default class PaymentApi extends Api {
  initiatePayment = async (params: { amount: number }) => {
    const url = this.getUrl('v2/pos/payment');
    const client = this.getClient();
    interceptor(client);
    return await client.post(url, qs.stringify(params));
  };

  getTransactions = async () => {
    const url = this.getUrl('v1/pos/payment');
    const client = this.getClient();
    interceptor(client);
    return await client.get(url);
  };

  getDueAmount = async () => {
    const url = this.getUrl('v1/pos-sale-due');
    const client = this.getClient();
    interceptor(client);
    return await client.get(url);
  };
}
