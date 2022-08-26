//TODO: Add proper typings for actions

export enum AppActionTypes {
  INITIALIZE = 'app_initialize',
  SYNC = 'app_sync',
  MODAL_SWITCH = 'app_modal_switch',
  LOGIN_SUCCESS = 'app_login_success',
  DISPLAY_MESSAGE = 'app_display_message',
  REPLACE_CART = 'app_cart_replace',
  STORE_UPDATE = 'app_store_update',
  ORDERS_DATE_RANGE = 'ORDERS_DATE_RANGE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  FETCHING_EXTERNAL_API = 'FETCHING_EXTERNAL_API',
  SHIPMENTS_DATE_RANGE = 'SHIPMENTS_DATE_RANGE',
  TOGGLE_TOAST = 'TOGGLE_TOAST',
  LOGOUT_LOADING = 'LOGOUT_LOADING',
  ORDERS_PROGRESS = 'ORDERS_PROGRESS',
  PRODUCTS_PROGRESS = 'PRODUCTS_PROGRESS',
  CUSTOMERS_PROGRESS = 'CUSTOMERS_PROGRESS',
  ADD_TOAST = 'add_stack',
  REMOVE_TOAST = 'remove_stack',
}
