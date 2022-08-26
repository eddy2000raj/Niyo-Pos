import Cart from '../../types/Cart';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);
import { ThunkyDispatch, GetState } from '../store';
import AppAction from './AppAction';
import { Mock_Customer, Mock_Points_Payment } from '../../stub/mock-data';
import Storage, { StorageKey } from '../../utils/Storage';
import CustomerAction from './CustomerAction';
import { SyncName, SyncStatus } from '../../types/Sync';
import DB from '../../utils/database/DB';
import Customer from '../../types/Customer';
import { PromiseExtended } from 'dexie';
//Mock uuidv4
jest.mock('uuid', () => ({ v4: () => 'test-111' }));
jest
  .spyOn(AppAction, 'replaceCart')
  .mockImplementation((cart: Cart, rebuild: boolean) => {
    return async (dispatch: ThunkyDispatch, getState: GetState) => {
      dispatch({
        type: 'app_cart_replace',
        payload: { cart: cart },
      });
    };
  });

jest
  .spyOn(AppAction, 'updateSync')
  .mockImplementation(
    (name: SyncName, status: SyncStatus, lastTimestamp?: number) => {
      return async (dispatch: ThunkyDispatch, getState: GetState) => {
        dispatch({
          type: 'app_update_sync',
          payload: '',
        });
      };
    }
  );

jest.spyOn(Storage, 'set').mockImplementation((ket: StorageKey, value: any) => {
  return '';
});

const myPromise: PromiseExtended = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('foo');
  }, 300);
});
//myPromise.timeout(200);

jest
  .spyOn(DB.customers, 'add')
  .mockImplementation(
    (item: Customer, key?: String): PromiseExtended<string> => {
      console.log('Promise called');
      return myPromise;
    }
  );

describe('Customer Actions', function () {
  let store;
  beforeEach(() => {
    store = mockStore({
      appState: {
        cart: {
          balance: 999,
          payments: [],
        },
        syncs: [],
        store: {
          id: 1,
        },
      },
    });
  });

  it('Should create customer', () => {
    store.dispatch(CustomerAction.create(Mock_Customer)).then(
      res => {
        //const actions = store.getActions();
        //console.log("create customer "+res);
        //expect(actions[0]).toEqual();
      },
      err => {
        console.log('create customer err' + err);
      }
    );
  });

  it('Should sync from server', () => {
    store.dispatch(CustomerAction.syncFromServer()).then(res => {
      const actions = store.getActions();
      console.log(actions);
      //expect(actions[0]).toEqual();
    });
  });
});
