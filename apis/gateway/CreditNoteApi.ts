import GatewayApi from './GatewayApi';
export default class CreditNoteApi extends GatewayApi {
  getReports = async ({ month, year, store }) => {
    const url = this.getUrl(
      `api/v1/monthly-rate-difference-note?month=${month}&year=${year}`
    );
    const client = await this.getClient();
    return client.get(url).then(res => res.data.data);
  };
}
