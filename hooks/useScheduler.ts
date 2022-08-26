import useTimer from './useTimer';
import CustomerAction from '../redux/actions/CustomerAction';
import OrderAction from '../redux/actions/OrderAction';
import ProductAction from '../redux/actions/ProductAction';
import { useThunkyDispatch } from '../redux/store';
import AppAction from '../redux/actions/AppAction';

const useScheduler = () => {
  const dispatch = useThunkyDispatch();
  useTimer(
    async () => await dispatch(OrderAction.syncToServer()),
    parseInt(process.env.NEXT_PUBLIC_ORDER_SYNC_TO_SERVER || '1') * 60 * 1000
  );
  useTimer(
    async () => await dispatch(OrderAction.syncFromServer()),
    parseInt(process.env.NEXT_PUBLIC_ORDER_SYNC_FROM_SERVER || '15') * 60 * 1000
  );
  useTimer(
    async () => await dispatch(CustomerAction.syncFromServer()),
    parseInt(process.env.NEXT_PUBLIC_CUSTOMER_SYNC_FROM_SERVER || '15') *
      60 *
      1000
  );
  useTimer(
    async () => await dispatch(ProductAction.syncFromServer()),
    parseInt(process.env.NEXT_PUBLIC_PRODUCT_SYNC_FROM_SERVER || '10') *
      60 *
      1000
  );
  useTimer(
    async () => await dispatch(AppAction.syncStoreFromServer()),
    parseInt(process.env.NEXT_PUBLIC_STORE_SYNC_FROM_SERVER || '1') * 60 * 1000
  );
  useTimer(
    async () => await dispatch(AppAction.fetchUserProfile()),
    parseInt(process.env.NEXT_PUBLIC_USER_SYNC_FROM_SERVER || '60') * 60 * 1000
  );
};

export default useScheduler;
