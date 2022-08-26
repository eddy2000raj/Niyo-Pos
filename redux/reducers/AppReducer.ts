import moment from 'moment';
import User from '../../types/User';
import { AppActionTypes } from '../ActionTypes';
import Sync, { SyncName } from '../../types/Sync';
import Store from '../../types/Store';
import Cart from '../../types/Cart';
import Toast, { BasicToast } from '../../types/Toast';
import { ModalName } from '../../types/Modal';
interface Progress {
  page: number;
  totalPages: number;
}
export interface AppState {
  socketData: any;
  name: string;
  store: Store;
  token: string;
  user: User;
  cart: Cart;
  modal?: {
    name: ModalName;
    data: {
      [key: string]: any;
    };
  };
  message?: { text: string; isError: boolean; milliseconds: number };
  syncs: { [key in SyncName]?: Sync };
  isInitialized: boolean;
  ui: {
    orders: {
      startDate: number | string;
      endDate: number | string;
    };
    shipments: {
      startDate: number | string;
      endDate: number | string;
    };
    networkError: boolean;
    fetchingExternalApi: boolean;
    toast: Toast;
    logoutLoading: boolean;
    ordersProgress: Progress;
    productsProgress: Progress;
    customersProgress: Progress;
    toastStack?: Array<BasicToast>;
  };
}

const initialState = {
  name: 'NiyoPOS',
  store: null,
  token: null,
  user: null,
  modal: null,
  cart: null,
  syncs: {},
  isInitialized: false,
  ui: {
    orders: {
      startDate: moment().startOf('month').unix(),
      endDate: moment().endOf('day').unix(),
    },
    shipments: {
      startDate: moment().startOf('month').unix(),
      endDate: moment().endOf('day').unix(),
    },
    networkError: false,
    fetchingExternalApi: false,
    toast: {
      show: false,
      title: '',
      description: '',
      bgColor: '',
      position: '',
    },
    logoutLoading: false,
    ordersProgress: {
      page: 1,
      totalPages: 1,
    },
    productsProgress: {
      page: 1,
      totalPages: 1,
    },
    customersProgress: {
      page: 1,
      totalPages: 1,
    },
    toastStack: [],
  },
  socketData: null,
};

const initialize = (state: AppState, action) => {
  const payload = action.payload;
  return {
    ...state,
    isInitialized: true,
    token: payload.token,
    store: payload.store,
    user: payload.user,
    syncs: payload.syncs,
    cart: payload.cart,
  };
};

const updateSyncs = (state: AppState, action): AppState => {
  const { syncs } = action.payload;
  return { ...state, syncs };
};

const updateMessage = (state: AppState, action): AppState => {
  const { text, isError, milliseconds } = action.payload;
  return { ...state, message: text ? { text, isError, milliseconds } : null };
};

const switchModal = (state: AppState, action) => {
  const payload = action.payload;
  return {
    ...state,
    modal: payload.name ? payload : null,
  };
};

const updateUser = (state: AppState, action) => {
  const payload = action.payload;
  return {
    ...state,
    user: payload.data,
    token: payload.token,
    store: payload.data.store,
  };
};

const updateStore = (state: AppState, action) => {
  const { store } = action.payload as { store: Store };
  return { ...state, store };
};

const updateStoreNew = (state: AppState, action) => {
  const { store } = action.payload;
  return { ...state, store };
};

const replaceCart = (state: AppState, action) => {
  const payload = action.payload;
  return { ...state, cart: payload.cart };
};

const updateOrdersDateRange = (state: AppState, action) => {
  const { payload } = action;
  return {
    ...state,
    ui: {
      ...state.ui,
      orders: {
        startDate: payload.startDate,
        endDate: payload.endDate,
      },
    },
  };
};

const updateNetworkError = (state: AppState, action) => {
  const { payload } = action;
  return {
    ...state,
    ui: {
      ...state.ui,
      networkError: payload,
    },
  };
};

const updateShipmentsDateRange = (state: AppState, action) => {
  const { payload } = action;
  return {
    ...state,
    ui: {
      ...state.ui,
      shipments: {
        startDate: payload.startDate,
        endDate: payload.endDate,
      },
    },
  };
};
const fetchingExternalApi = (state: AppState, action) => {
  const { payload } = action;
  return {
    ...state,
    ui: {
      ...state.ui,
      fetchingExternalApi: payload,
    },
  };
};

const toggleToast = (state: AppState, action) => {
  const payload = action.payload;

  return {
    ...state,
    ui: {
      ...state.ui,
      toast: payload.title ? payload : null,
    },
  };
};

const logoutLoading = (state: AppState, action) => {
  const payload = action.payload;

  return {
    ...state,
    ui: {
      ...state.ui,
      logoutLoading: payload,
    },
  };
};

const updateOrdersProgress = (state: AppState, action) => {
  const payload = action.payload;
  return {
    ...state,
    ui: {
      ...state.ui,
      ordersProgress: {
        page: payload.page,
        totalPages: payload.totalPages,
      },
    },
  };
};

const updateProductsProgress = (state: AppState, action) => {
  const payload = action.payload;
  return {
    ...state,
    ui: {
      ...state.ui,
      productsProgress: {
        page: payload.page,
        totalPages: payload.totalPages,
      },
    },
  };
};

const updateCustomersProgress = (state: AppState, action) => {
  const payload = action.payload;
  return {
    ...state,
    ui: {
      ...state.ui,
      customersProgress: {
        page: payload.page,
        totalPages: payload.totalPages,
      },
    },
  };
};

const addToastToStack = (state: AppState, action) => {
  const payload = action.payload;
  const toasts = state.ui.toastStack;
  if (toasts.length < 5) {
    toasts.push({
      title: payload.title,
      description: payload.description,
      bgColor: !!payload.bgColor ? payload.bgColor : 'bg-red',
      position: !!payload.position ? payload.position : 'top-right',
      duration: !!payload.duration ? payload.duration : 1500,
    });
  }
  return {
    ...state,
    ui: {
      ...state.ui,
      toastStack: toasts,
    },
  };
};

const removeToastFromStack = (state: AppState) => {
  const toasts = state.ui.toastStack;
  if (toasts.length) toasts.shift();
  return {
    ...state,
    ui: {
      ...state.ui,
      toastStack: toasts,
    },
  };
};

const AppReducer = (state: AppState, action): AppState => {
  const map: { [key: string]: (state: AppState, action) => AppState } = {
    [AppActionTypes.INITIALIZE]: initialize,
    [AppActionTypes.SYNC]: updateSyncs,
    [AppActionTypes.DISPLAY_MESSAGE]: updateMessage,
    [AppActionTypes.MODAL_SWITCH]: switchModal,
    [AppActionTypes.LOGIN_SUCCESS]: updateUser,
    [AppActionTypes.REPLACE_CART]: replaceCart,
    [AppActionTypes.STORE_UPDATE]: updateStore,
    [AppActionTypes.ORDERS_DATE_RANGE]: updateOrdersDateRange,
    [AppActionTypes.SHIPMENTS_DATE_RANGE]: updateShipmentsDateRange,
    [AppActionTypes.NETWORK_ERROR]: updateNetworkError,
    [AppActionTypes.FETCHING_EXTERNAL_API]: fetchingExternalApi,
    [AppActionTypes.TOGGLE_TOAST]: toggleToast,
    [AppActionTypes.LOGOUT_LOADING]: logoutLoading,
    [AppActionTypes.ORDERS_PROGRESS]: updateOrdersProgress,
    [AppActionTypes.PRODUCTS_PROGRESS]: updateProductsProgress,
    [AppActionTypes.CUSTOMERS_PROGRESS]: updateCustomersProgress,
    [AppActionTypes.ADD_TOAST]: addToastToStack,
    [AppActionTypes.REMOVE_TOAST]: removeToastFromStack,
  };
  const reducer = map[action.type];
  return reducer ? reducer(state, action) : state || initialState;
};

export default AppReducer;
