import DB from '../../utils/database/DB';
import Toolkit from '../../utils/Toolkit';
import OrderApi from '../../apis/OrderApi';
import AppActions from './AppAction';
import { SyncName, SyncStatus } from '../../types/Sync';
import moment from 'moment';
import Storage, { StorageKey } from '../../utils/Storage';
import Cart from '../../types/Cart';
import Order, { OrderStatus } from '../../types/Order';
import { RootState, ThunkyAction } from '../store';
import OrderMapper from '../../mappers/OrderMapper';
import OrderItem, { OrderItemStatus } from '../../types/OrderItem';
import AppAction from './AppAction';

const syncToServer = (): ThunkyAction<Promise<any>> => {
  return async (dispatch, getState) => {
    const sync = getState().appState.syncs[SyncName.ORDER_LOCAL];
    if (!sync || sync.status !== SyncStatus.IN_PROGRESS) {
      try {
        dispatch(
          AppActions.updateSync(SyncName.ORDER_LOCAL, SyncStatus.IN_PROGRESS)
        );
        const limit = 10;
        let hasMore = false;
        do {
          const orders = await DB.orders
            .where('synced')
            .equals(0)
            .limit(limit)
            .sortBy('created_at');
          if (orders.length > 0) {
            const apiProps = Toolkit.mapStateToApiProps(getState());
            const response = await new OrderApi(apiProps).createOrUpdate({
              orders,
            });
            const results = response.data.data;
            const syncedOrders = results.map(syncedOrder => {
              syncedOrder.synced = 1;
              return syncedOrder;
            });
            await DB.orders.bulkPut(syncedOrders);
          }
          hasMore = orders.length == limit;
        } while (hasMore);
        dispatch(
          AppActions.updateSync(SyncName.ORDER_LOCAL, SyncStatus.COMPLETED)
        );
      } catch (error) {
        dispatch(
          AppActions.updateSync(SyncName.ORDER_LOCAL, SyncStatus.FAILED)
        );
      }
    }
  };
};

const deleteOutDatedOrders = () => {
  return async (dispatch, getState) => {
    const formattedBoundaryTime = moment()
      .subtract(3, 'months')
      .startOf('month')
      .unix();
    const outdatedOrders = await DB.orders
      .where('synced')
      .equals(1)
      .and(
        (order: Order) =>
          order.created_at && order.created_at < formattedBoundaryTime
      )
      .primaryKeys();
    await DB.orders.bulkDelete(outdatedOrders);
  };
};

const syncFromServer = (): ThunkyAction<Promise<any>> => {
  return async (dispatch, getState) => {
    const sync = getState().appState.syncs[SyncName.ORDER_SERVER];
    if (!sync || sync.status !== SyncStatus.IN_PROGRESS) {
      try {
        dispatch(
          AppActions.updateSync(SyncName.ORDER_SERVER, SyncStatus.IN_PROGRESS)
        );
        dispatch(deleteOutDatedOrders());
        const apiProps = Toolkit.mapStateToApiProps(getState());
        let page = 0;
        let totalPages = 1;
        const per_page = 100;
        const timestamp = sync ? sync.timestamp : null;
        let lastUpdatedAt = 0;
        do {
          page++;
          const response = await new OrderApi(apiProps).fetch({
            page,
            per_page,
            timestamp,
          });
          dispatch(
            AppAction.syncOrdersProgress({
              name: 'serverOrders',
              page: response.data.meta.current_page,
              totalPages: response.data.meta.last_page,
            })
          );
          totalPages = response.data.meta.last_page;
          const orders: Order[] = [];
          //Note: Incase of race condition we can wrap primaryKeys and bulkPut into a transaction
          const unsyncedOrderIDs = await DB.orders
            .where('synced')
            .equals(0)
            .primaryKeys();
          for (const order of response.data.data) {
            if (!unsyncedOrderIDs.includes(order.id)) {
              orders.push({ ...order, synced: 1 });
            }
            if (
              order.cancellation_requested === true &&
              order.cancellable_statuses.includes(order.status)
            ) {
              await dispatch(cancel(order));
              const findIndex = orders.findIndex(ordr => ordr.id === order.id);
              findIndex !== -1 && orders.splice(findIndex, 1);
            }
          }
          await DB.orders.bulkPut(orders);
          if (orders && orders.length > 0 && (timestamp || page === 1)) {
            const newOrders = new BroadcastChannel('new-orders');
            newOrders.postMessage('New Orders Added to DB');
          }
          lastUpdatedAt = Math.max(
            response.data.last_updated_at,
            lastUpdatedAt
          );
        } while (page < totalPages);
        dispatch(
          AppActions.updateSync(
            SyncName.ORDER_SERVER,
            SyncStatus.COMPLETED,
            lastUpdatedAt
          )
        );
      } catch (error) {
        dispatch(
          AppActions.updateSync(SyncName.ORDER_SERVER, SyncStatus.FAILED)
        );
      }
    }
  };
};

const confirm = (cart: Cart): ThunkyAction<Promise<Order>> => {
  return async (dispatch, getState: () => RootState) => {
    await DB.carts.delete(cart.id);
    const order = OrderMapper.fromCart(cart);
    order.items = order.items.map(item => {
      if (item.status == OrderItemStatus.PENDING) {
        return { ...item, status: OrderItemStatus.CONFIRMED };
      }
      return item;
    });
    order.status = OrderStatus.CONFIRMED;
    if (order.delivery_mode === 'delivery') {
      order.display_status = 'Ready for Delivery';
    } else {
      order.display_status = 'Ready for Pickup';
    }
    await DB.orders.put(order);
    return order;
  };
};

const create = (cart: Cart): ThunkyAction<Promise<Order>> => {
  return async (dispatch, getState: () => RootState) => {
    const rootState = getState();
    const store = rootState.appState.store;
    const lastReceipt = Storage.get(StorageKey.LAST_RECEIPT, 0);
    await DB.carts.delete(cart.id);
    const order = OrderMapper.fromCart(cart);
    const random = moment().unix() + Math.floor(Math.random() * 9) + 1;
    if (!order.ref_id) {
      order.mallOrder
        ? (order.ref_id = `O1KM-${store.id}-${random}`)
        : (order.ref_id = `O1K-${store.id}-${random}`);
    }
    order.items = order.items.map(item => {
      if (item.status == OrderItemStatus.CONFIRMED) {
        return { ...item, status: OrderItemStatus.FULFILLED };
      }
      return item;
    });
    order.status = OrderStatus.FULFILLED;
    order.receipt_number = parseInt(lastReceipt) + 1;
    order.invoice_number = store.settings.invoice_format.replace(
      '<receipt_number>',
      order.receipt_number.toString()
    );
    Storage.set(StorageKey.LAST_RECEIPT, order.receipt_number);
    const rule_ids = [];
    order.items.forEach(item => {
      item.discounts.forEach(discount => {
        if (discount.rule) rule_ids.push(discount.rule.id);
      });
    });
    if (rule_ids.length > 0) {
      let associated_rules = await DB.rules.bulkGet(rule_ids);
      associated_rules = associated_rules.filter(
        rule_id => rule_id !== undefined
      );
      if (associated_rules.length > 0) {
        order.associated_rules = associated_rules;
      }
    }
    if (order.parent_ref_id) {
      const parentOrder = await DB.orders
        .where('ref_id')
        .equals(order.parent_ref_id)
        .toArray();
      const itemIds = parentOrder[0].items.reduce(
        (ids: string[], item: OrderItem) => ids.concat(item.id),
        []
      );
      const rOrders = await DB.orders
        .where('return_item_ids')
        .anyOf(itemIds)
        .distinct()
        .toArray();
      parentOrder[0].items
        .filter((item: OrderItem) => item.status == OrderItemStatus.FULFILLED)
        .map(item => {
          let qtyReturned = 0;
          rOrders.forEach(rOrder => {
            const returnItem = rOrder.items.filter(
              rItem =>
                rItem.parent_item?.id == item.id &&
                rItem.status == OrderItemStatus.RETURNED
            );
            if (returnItem.length > 0) {
              qtyReturned += returnItem[0].quantity;
            }
          });
        });
      let totalQuantity = 0;
      let totalReturnedItemsQuantity = 0;
      order.items.map(
        item =>
          (totalReturnedItemsQuantity =
            totalReturnedItemsQuantity + Math.abs(item.quantity))
      );
      parentOrder[0].items.map(
        item => (totalQuantity = totalQuantity + item.quantity)
      );
      if (totalReturnedItemsQuantity < totalQuantity) {
        order.display_status = 'Order Partially Returned';
      } else if (totalReturnedItemsQuantity === totalQuantity) {
        order.display_status = 'Order Returned';
      }
    }
    await DB.orders.put(order);
    return order;
  };
};

const cancel = (order: Order): ThunkyAction<Promise<Order>> => {
  return async (dispatch, getState: () => RootState) => {
    order.items.forEach(item => (item.status = OrderItemStatus.CANCELLED));
    const refundPayments = [];
    order.payments.forEach(payment => {
      refundPayments.push({
        method: payment.method,
        value: -payment.value,
      });
    });
    const updatedOrder: Order = {
      ...order,
      synced: 0,
      status: OrderStatus.CANCELLED,
      payments: [...order.payments, ...refundPayments],
      display_status: 'Cancelled',
    };
    await DB.orders.put(updatedOrder);
    return updatedOrder;
  };
};

export default { syncToServer, syncFromServer, confirm, create, cancel };
