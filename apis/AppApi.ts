import Api from './Api';
import qs from 'qs';
import interceptor from '../utils/Interceptor';

export default class AppApi extends Api {
  sendOtp = async (params: { mobile: string }, re_auth?: boolean) => {
    let route = 'v1/send-otp';
    if (re_auth) route = `${route}?re_auth=${re_auth}`;

    const url = this.getUrl(route);
    const client = this.getClient();
    interceptor(client);
    return await client.post(url, qs.stringify(params));
  };

  login = async (
    params: { mobile: string; otp: string },
    re_auth?: boolean
  ) => {
    let route = 'v1/login';
    if (re_auth) route = `${route}?re_auth=${re_auth}`;

    const url = this.getUrl(route);
    const client = this.getClient();
    interceptor(client);
    return await client.post(url, qs.stringify(params));
  };

  logout = async () => {
    const url = this.getUrl('v1/logout');
    const client = this.getClient();
    interceptor(client);
    return await client.get(url);
  };

  fetchStore = async () => {
    const url = this.getUrl('v1/store');
    const client = this.getClient();
    interceptor(client);
    return await client.get(url);
  };

  fcmToken = async (params: { token: string }) => {
    const url = this.getUrl('v1/user/token');
    const client = this.getClient();
    interceptor(client);
    return await client.post(url, qs.stringify(params));
  };

  fetchUserProfile = async () => {
    const url = this.getUrl('v1/user/me');
    const client = this.getClient();
    interceptor(client);
    return await client.get(url);
  };

  setGatewayToken = async () => {
    const url = this.getUrl('v1/api-gateway/token');
    const client = this.getClient();
    interceptor(client);
    return await client.get(url);
  };
}
