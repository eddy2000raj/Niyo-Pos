import { AppActionTypes } from '../ActionTypes';
import AppApi from '../../apis/AppApi';
import Toolkit from '../../utils/Toolkit';
import DB from '../../utils/database/DB';
import { SyncName, SyncStatus } from '../../types/Sync';
import OrderAction from './OrderAction';
import ProductAction from './ProductAction';
import CustomerAction from './CustomerAction';
import Storage, { StorageKey } from '../../utils/Storage';
import moment from 'moment';
import RuleAction from './RuleAction';
import Cart from '../../types/Cart';
import CartAction from './cart/CartAction';
import { RootState, ThunkyDispatch, GetState, ThunkyAction } from '../store';
import Store from '../../types/Store';
import { ModalName } from '../../types/Modal';
const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;

const initialize = (): ThunkyAction<Promise<any>> => {
  return async (dispatch, getState) => {
    const token = Storage.get(StorageKey.TOKEN, null);
    const user = Storage.get(StorageKey.USER, null);
    const store = Storage.get(StorageKey.STORE, null);
    const syncs = Storage.get(StorageKey.SYNCS, {});
    const cart = CartAction.fresh();
    const payload = { token, user, store, syncs, cart };
    dispatch({ type: AppActionTypes.INITIALIZE, payload });
    if (token) {
      dispatch(sync());
    }
  };
};

const displayMessage = (
  text: string,
  isError: boolean,
  milliseconds: number = 3000
) => {
  return {
    type: AppActionTypes.DISPLAY_MESSAGE,
    payload: { text, isError, milliseconds },
  };
};

//let socketInstance;
const sync = (): ThunkyAction<Promise<any>> => {
  return async (dispatch, getState) => {
    //synching via socket starts here
    const ruleSync = getState().appState.syncs[SyncName.RULE_SERVER];
    const store = Storage.get(StorageKey.STORE, null);
    const user = Storage.get(StorageKey.USER, null);
    const token = Storage.get(StorageKey.TOKEN, null);
    console.log('Store-Id from localstorage' + store.id);
    console.log('device-Id from localstorage' + user.device_no);
    console.log('JWT token from localstorage' + token);
    const ruleSyncTimestamp = ruleSync ? ruleSync.timestamp : null;
    try {
      const worker: Worker = new Worker('./workers/worker.js');
      //write now we are only connecting and adding runtime status of machine in server
      worker.postMessage([
        store.id,
        user.device_no,
        ruleSyncTimestamp,
        SOCKET_SERVER_URL,
        token,
      ]);
      // worker.onmessage = function (message: any) {
      //   const { data } = message;
      //   const { type, config } = JSON.parse(data);
      //   if (type == 'store') {
      //     console.log(
      //       'Data received in web worker for store settings with last timestamp ' +
      //         config['last_updated_at']
      //     );
      //     config.store['last_updated_at'] = config['last_updated_at'];
      //     dispatch(updateStoreFromSocketServer(config['store']));
      //   }
      //   if (
      //     type == 'rule' &&
      //     config['rule'].results &&
      //     config['rule'].results.length > 0
      //   ) {
      //     console.log(
      //       'Data received in web worker for store settings with last timestamp ' +
      //         config['last_updated_at']
      //     );
      //     config.rule['last_updated_at'] = config['last_updated_at'];
      //     //config.rule['initialLoading'] = config['initialLoading'];
      //     dispatch(RuleAction.syncFromServerBySocket(config['rule']));
      //   }
      // };
    } catch (error) {
      //fallback if worker failed to load need to assure on error type before handling
      //await dispatch(RuleAction.syncFromServer());
      //await dispatch(syncStoreFromServer());
    }

    //synching via socket starts ends
    await dispatch(OrderAction.syncToServer());
    await dispatch(ProductAction.syncFromServer());
    await dispatch(OrderAction.syncFromServer());
    await dispatch(CustomerAction.syncFromServer());
    await dispatch(fetchUserProfile());
    await dispatch(RuleAction.syncFromServer());
    await dispatch(syncStoreFromServer());
  };
};

const fetchUserProfile = () => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    const apiProps = Toolkit.mapStateToApiProps(getState());
    const sync = getState().appState.syncs[SyncName.USER_PROFILE];
    if (!sync || sync.status !== SyncStatus.IN_PROGRESS) {
      try {
        dispatch(updateSync(SyncName.USER_PROFILE, SyncStatus.IN_PROGRESS));
        const response = await new AppApi(apiProps).fetchUserProfile();
        const store = Storage.get(StorageKey.STORE, null);
        const user = {
          ...response.data.data,
          roles: [response.data.data.roles[0].name],
          store: store,
        };
        Storage.set(StorageKey.USER, user);
        dispatch({
          type: AppActionTypes.LOGIN_SUCCESS,
          payload: { data: user, token: Storage.get(StorageKey.TOKEN, null) },
        });
        dispatch(updateSync(SyncName.USER_PROFILE, SyncStatus.COMPLETED));
      } catch (error) {
        dispatch(updateSync(SyncName.USER_PROFILE, SyncStatus.FAILED));
      }
    }
  };
};
const switchModal = (name: ModalName, data: any = {}) => {
  return { type: AppActionTypes.MODAL_SWITCH, payload: { name, data } };
};

const sendOtp = ({ mobile }, re_auth?: boolean): ThunkyAction => {
  mobile = '+91' + mobile;
  return async (dispatch, getState) => {
    const apiProps = Toolkit.mapStateToApiProps(getState());
    await new AppApi(apiProps)
      .sendOtp({ mobile }, re_auth)
      .then(response => {
        if (response.status) dispatch(updateNetworkError(false));
        dispatch({
          type: AppActionTypes.DISPLAY_MESSAGE,
          payload: { text: 'OTP Sent successfully.', isError: false },
        });
      })
      .catch(error => {
        const { data } = error.response;
        let text = 'Unable to send OTP. Please enter correct mobile.';

        if (data && data.message) {
          text = data.message;
        }

        dispatch({
          type: AppActionTypes.DISPLAY_MESSAGE,
          payload: { text, isError: true },
        });
      });
  };
};

const login = ({ mobile, otp }, re_auth?: boolean): ThunkyAction => {
  mobile = '+91' + mobile;
  return async (dispatch, getState) => {
    const apiProps = Toolkit.mapStateToApiProps(getState());
    await new AppApi(apiProps)
      .login({ mobile, otp }, re_auth)
      .then(response => {
        const result = response.data;
        dispatch({
          type: AppActionTypes.DISPLAY_MESSAGE,
          payload: { text: null, isError: false, milliseconds: 0 },
        });
        Storage.set(StorageKey.TOKEN, result.token);
        Storage.set(StorageKey.USER, result.data);
        Storage.set(StorageKey.STORE, result.data.store);
        Storage.set(
          StorageKey.LAST_RECEIPT,
          result.data.store.settings.receipt_number
        );
        debugger;
        Storage.set(StorageKey.IS_LOGIN, true);
        dispatch({ type: AppActionTypes.LOGIN_SUCCESS, payload: result });
        dispatch(sync());
      })
      .catch(error => {
        const { data } = error.response;
        let text = 'Unable to login. Please enter correct credentials.';

        if (data && data.message) {
          text = data.message;
        }

        dispatch({
          type: AppActionTypes.DISPLAY_MESSAGE,
          payload: { text, isError: true },
        });
      });
  };
};

const logout = () => {
  return async (dispatch, getState) => {
    const exists = await DB.orders.where('synced').equals(0).first();
    if (exists) {
      dispatch(displayMessage('Cannot logout. Unsynced orders present', true));
    } else {
      try {
        const apiProps = Toolkit.mapStateToApiProps(getState());
        dispatch(logoutLoading(true));
        await new AppApi(apiProps).logout();
        Storage.clear();
        await DB.delete();
        location.reload();
        await dispatch(logoutLoading(false));
      } catch (e) {
        console.error(e);
        dispatch(logoutLoading(false));
      }
    }
  };
};

const syncStoreFromServer = () => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    const rootState = getState();
    const apiProps = Toolkit.mapStateToApiProps(getState());
    const sync = rootState.appState.syncs[SyncName.STORE];
    if (!sync || sync.status !== SyncStatus.IN_PROGRESS) {
      try {
        dispatch(updateSync(SyncName.STORE, SyncStatus.IN_PROGRESS));
        const response = await new AppApi(apiProps).fetchStore();
        const store: Store = response.data.data;
        Storage.set(StorageKey.STORE, store);
        dispatch({ type: AppActionTypes.STORE_UPDATE, payload: { store } });
        dispatch(updateSync(SyncName.STORE, SyncStatus.COMPLETED));
        if (
          parseFloat(process.env.NEXT_PUBLIC_APP_VERSION) <
            store.settings.min_app_version &&
          rootState.appState.cart.items.length == 0
        ) {
          location.reload();
        } else if (
          parseFloat(process.env.NEXT_PUBLIC_APP_VERSION) <
          store.settings.latest_app_version
        ) {
          const text = 'New Version Available. Please refresh to update.';
          dispatch(displayMessage(text, true, 20000));
        }
      } catch (error) {
        dispatch(updateSync(SyncName.STORE, SyncStatus.FAILED));
      }
    }
  };
};

const sendProductsUpdateNotificationToServer = (timestamp: number) => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    try {
      console.log('products-updated emitted');
      socketInstance.emit('products-updated', timestamp);
      //socketInstance.emit("store","store message");
    } catch (error) {
      if (error.message === 'Network Error') dispatch(updateNetworkError(true));
      dispatch(updateSync(SyncName.STORE, SyncStatus.FAILED));
    }
  };
};
const updateSync = (
  name: SyncName,
  status: SyncStatus,
  lastTimestamp?: number
) => {
  return async (dispatch, getState) => {
    let syncs = (getState() as RootState).appState.syncs;
    let timestamp = syncs[name] ? syncs[name].timestamp : null;
    if (status == SyncStatus.COMPLETED) {
      timestamp = lastTimestamp ?? Date.now();
    }

    syncs = { ...syncs, [name]: { name, status, timestamp } };
    const syncsToPersist = {};
    Object.keys(syncs).forEach(key => {
      syncsToPersist[key] = { ...syncs[key], status: SyncStatus.COMPLETED };
    });
    Storage.set(StorageKey.SYNCS, syncs);
    dispatch({ type: AppActionTypes.SYNC, payload: { syncs } });
  };
};

const replaceCart = (cart: Cart = null, rebuild: boolean = true) => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    cart = cart ? cart : CartAction.fresh();
    const updatedCart = rebuild ? await dispatch(CartAction.build(cart)) : cart;
    dispatch({
      type: AppActionTypes.REPLACE_CART,
      payload: { cart: updatedCart },
    });
  };
};

const updateOrdersDateRange = (startDate, endDate) => {
  return {
    type: AppActionTypes.ORDERS_DATE_RANGE,
    payload: {
      startDate,
      endDate,
    },
  };
};

const updateNetworkError = (networkError: boolean) => {
  return {
    type: AppActionTypes.NETWORK_ERROR,
    payload: networkError,
  };
};

const fetchingExternalApi = (fetching: boolean) => {
  return {
    type: AppActionTypes.FETCHING_EXTERNAL_API,
    payload: fetching,
  };
};

const updateShipmentsDateRange = (startDate, endDate) => {
  return {
    type: AppActionTypes.SHIPMENTS_DATE_RANGE,
    payload: {
      startDate,
      endDate,
    },
  };
};

const logoutLoading = (loading: boolean) => {
  return {
    type: AppActionTypes.LOGOUT_LOADING,
    payload: loading,
  };
};

const toggleToast = (data: any = {}) => {
  return { type: AppActionTypes.TOGGLE_TOAST, payload: data };
};

const getGatewayToken = () => {
  return async (dispatch, getState) => {
    const apiProps = Toolkit.mapStateToApiProps(getState());
    const res = await new AppApi(apiProps).setGatewayToken();
    if (res?.data?.data?.token != undefined) {
      Storage.set(StorageKey.TOKEN_GATEWAY, res.data.data.token);
    }
  };
};

const syncProductsProgress = (data: any = {}) => {
  return { type: AppActionTypes.PRODUCTS_PROGRESS, payload: data };
};

const syncOrdersProgress = (data: any = {}) => {
  return { type: AppActionTypes.ORDERS_PROGRESS, payload: data };
};

const syncCustomersProgress = (data: any = {}) => {
  return { type: AppActionTypes.CUSTOMERS_PROGRESS, payload: data };
};

const pushToast = (data: any = {}) => {
  return { type: AppActionTypes.ADD_TOAST, payload: data };
};

const popToast = () => {
  return { type: AppActionTypes.REMOVE_TOAST };
};

export default {
  initialize,
  sync,
  updateSync,
  displayMessage,
  switchModal,
  sendOtp,
  login,
  logout,
  replaceCart,
  syncStoreFromServer,
  updateOrdersDateRange,
  updateNetworkError,
  fetchingExternalApi,
  updateShipmentsDateRange,
  toggleToast,
  fetchUserProfile,
  sendProductsUpdateNotificationToServer,
  getGatewayToken,
  syncProductsProgress,
  syncOrdersProgress,
  syncCustomersProgress,
  pushToast,
  popToast,
};
