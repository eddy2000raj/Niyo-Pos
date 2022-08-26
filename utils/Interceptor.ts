import AppAction from '../redux/actions/AppAction';
import { ModalName } from '../types/Modal';
import Storage, { StorageKey } from './Storage';

const interceptor = client => {
  const store = window['__NEXT_REDUX_STORE__'];
  client.interceptors.response.use(
    response => {
      if (response.status) store.dispatch(AppAction.updateNetworkError(false));
      return response;
    },
    error => {
      if (location.pathname !== '/login') {
        if (error.message === 'Network Error')
          store.dispatch(AppAction.updateNetworkError(true));
        if (error?.response?.status === 401) {
          Storage.set(StorageKey.IS_LOGIN, false);
          store.dispatch(AppAction.switchModal(ModalName.RELOGIN));
        } else if (error?.response?.status === 402) {
          // open date setting  modal
          Storage.set(StorageKey.SERVER_TIME, error.response.data.server_time);
          store.dispatch(AppAction.switchModal(ModalName.CHANGE_DATE));
        }
      }
      return Promise.reject(error);
    }
  );
};

export default interceptor;
