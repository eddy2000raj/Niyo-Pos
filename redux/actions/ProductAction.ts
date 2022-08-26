import Toolkit from '../../utils/Toolkit';
import ProductApi from '../../apis/ProductApi';
import DB from '../../utils/database/DB';
import AppAction from './AppAction';
import { SyncName, SyncStatus } from '../../types/Sync';
import { ThunkyAction } from '../store';

const syncFromServer = (): ThunkyAction<Promise<any>> => {
  return async (dispatch, getState) => {
    const apiProps = Toolkit.mapStateToApiProps(getState());
    const sync = getState().appState.syncs[SyncName.PRODUCT_SERVER];
    if (!sync || sync.status !== SyncStatus.IN_PROGRESS) {
      try {
        dispatch(
          AppAction.updateSync(SyncName.PRODUCT_SERVER, SyncStatus.IN_PROGRESS)
        );
        let page = 0;
        let totalPages = 1;
        const per_page = 500;
        const timestamp = sync ? sync.timestamp : null;
        let lastUpdatedAt = 0;
        do {
          page++;
          const response = await new ProductApi(apiProps).fetch({
            page,
            per_page,
            timestamp,
          });
          dispatch(
            AppAction.syncProductsProgress({
              name: 'products',
              page: response.data.meta.current_page,
              totalPages: response.data.meta.last_page,
            })
          );
          totalPages = response.data.meta.last_page;
          const data = response.data.data;
          const productsToDelete = [];
          const productsToPut = [];
          for (const product of data) {
            if (product.is_deleted) {
              productsToDelete.push(product.id);
            } else {
              productsToPut.push(product);
            }
          }
          await DB.transaction('rw', DB.products, () => {
            DB.products.bulkPut(productsToPut);
            DB.products.bulkDelete(productsToDelete);
          });
          lastUpdatedAt = Math.max(
            response.data.last_updated_at,
            lastUpdatedAt
          );
        } while (page < totalPages);
        dispatch(
          AppAction.updateSync(
            SyncName.PRODUCT_SERVER,
            SyncStatus.COMPLETED,
            lastUpdatedAt
          )
        );
      } catch (error) {
        dispatch(
          AppAction.updateSync(SyncName.PRODUCT_SERVER, SyncStatus.FAILED)
        );
      }
    }
  };
};

export default { syncFromServer };
