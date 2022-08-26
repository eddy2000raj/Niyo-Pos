import Toolkit from '../../utils/Toolkit';
import DB from '../../utils/database/DB';
import CustomerApi from '../../apis/CustomerApi';
import Customer from '../../types/Customer';
import { v4 as uuidv4 } from 'uuid';
import AppActions from './AppAction';
import { SyncName, SyncStatus } from '../../types/Sync';
import { ThunkyAction } from '../store';
import AppAction from './AppAction';

const syncFromServer = (): ThunkyAction<Promise<any>> => {
  return async (dispatch, getState) => {
    const sync = getState().appState.syncs[SyncName.CUSTOMER_SERVER];
    if (!sync || sync.status !== SyncStatus.IN_PROGRESS) {
      try {
        dispatch(
          AppActions.updateSync(
            SyncName.CUSTOMER_SERVER,
            SyncStatus.IN_PROGRESS
          )
        );
        const apiProps = Toolkit.mapStateToApiProps(getState());
        let page = 0;
        let totalPages = 1;
        const timestamp = sync ? sync.timestamp : null;
        console.log('Store ' + JSON.stringify(apiProps));
        do {
          page++;
          console.log('Inside do ' + page);
          const response = await new CustomerApi(apiProps).getCustomers({
            page,
            timestamp,
          });
          dispatch(
            AppAction.syncCustomersProgress({
              name: 'customers',
              page: response.data.meta.current_page,
              totalPages: response.data.meta.last_page,
            })
          );
          totalPages = response.data.meta.last_page;
          const data = response.data.data;
          console.log('data ' + JSON.stringify(data));
          await DB.customers.bulkPut(data);
        } while (page < totalPages);
        dispatch(
          AppActions.updateSync(SyncName.CUSTOMER_SERVER, SyncStatus.COMPLETED)
        );
      } catch (error) {
        dispatch(
          AppActions.updateSync(SyncName.CUSTOMER_SERVER, SyncStatus.FAILED)
        );
      }
    }
  };
};

const create = (
  data: Omit<Customer, 'id'>
): ThunkyAction<Promise<Customer>> => {
  return async (dispatch, getState) => {
    const customer = { ...data, id: uuidv4() };
    try {
      const refId = await DB.customers.add(customer);
      return await DB.customers.get(refId);
    } catch (error) {
      return error;
    }
  };
};

export default { syncFromServer, create };
