import React, { useState, useEffect } from 'react';
import moment from 'moment';
import AppActions from '../../redux/actions/AppAction';
import OrderItem, {
  OrderItemStatus,
  OrderItemSource,
} from '../../types/OrderItem';
import Order, { OrderStatus } from '../../types/Order';
import Payment from '../../types/Payment';
import { useDispatch } from 'react-redux';
import DB from '../../utils/database/DB';
import OrderHelper from '../../utils/OrderHelper';
import { formatCurrency } from '../../utils/Toolkit';
import { PriceType } from '../../types/Product';
import ReceiptFormat from '../ReceiptFormat';
import Analytics from '../../utils/Analytics';
import { Event } from '../../types/Event';
import { ModalName } from '../../types/Modal';
import Storage, { StorageKey } from '../../utils/Storage';

const ReturnItemList = ({ returnOrders }) => {
  let index = 0;
  return returnOrders.map((order: Order) => {
    return order.items
      .filter(item => item.status == OrderItemStatus.RETURNED)
      .map((item: OrderItem) => {
        return (
          <div className="grid gutter-sm mt-sm" key={item.id + order.ref_id}>
            <div>#{++index}</div>
            <div className="col grow">
              <div>{item.product.name}</div>
              <div>Qty: {Math.abs(item.quantity)}</div>
            </div>
            <div className="right">Invoice No: {order.invoice_number}</div>
          </div>
        );
      });
  });
};

const renderOrderItem = (item: OrderItem, index: number) => {
  return (
    <React.Fragment key={item.id}>
      <div className="mt-sm">
        <div className="grid gutter-sm">
          <div>#{++index}</div>
          <div className="col grow">
            <div>
              {item.product.name} {item.total < 0 ? '(Return)' : ''}
            </div>
            <div>
              {item.quantity} x {formatCurrency(item.product.mrp)}
            </div>
            {item.source == OrderItemSource.OFFER && (
              <div className="xs green bold">
                <i className="fas fa-percentage mr-xs"></i> FREE ITEM
              </div>
            )}
          </div>
          <div className="right semi-bold">
            <div>{formatCurrency(item.total)}</div>
            {item.discount > 0 && (
              <span className="strike xs normal">
                {formatCurrency(item.product.mrp * item.quantity)}
              </span>
            )}
          </div>
        </div>
      </div>
      <hr className="hr light mt-sm" />
    </React.Fragment>
  );
};

interface Props {
  order: Order;
  accept: any;
  reject: any;
}

const OrderDetail = ({ order, accept, reject }: Props) => {
  const [loading, setLoading] = useState(false);
  const [availableReturnItems, setAvailableReturnItems] = useState([]);
  const [returnWindowExpiredItems, setReturnWindowExpiredItems] = useState([]);
  const [returnOrders, setReturnOrders] = useState(null);
  const [returnReason, setReturnReason] = useState(null);
  const dispatch = useDispatch();

  const store = Storage.get(StorageKey.STORE, null);

  useEffect(() => {
    setAvailableReturnItems([]);
    setReturnOrders(null);
    setReturnWindowExpiredItems([]);
    processReturns();
    if (order.order_return_reason_id) {
      setReturnReason(
        store.settings.return_reasons.filter(
          reason => reason.id == order.order_return_reason_id
        )[0].title
      );
    }
  }, [order]);

  const showReturnModal = async () => {
    dispatch(
      AppActions.switchModal(ModalName.RETURN_ITEMS, {
        items: availableReturnItems,
        order: order,
        expiredItems: returnWindowExpiredItems,
        returnOrders: returnOrders,
      })
    );
  };

  const processReturns = async () => {
    setLoading(true);
    const itemIds = order.items.reduce(
      (ids: string[], item: OrderItem) => ids.concat(item.id),
      []
    );
    const rOrders = await DB.orders
      .where('return_item_ids')
      .anyOf(itemIds)
      .distinct()
      .toArray();
    order.items
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

        const allowedReturnQty = item.quantity - Math.abs(qtyReturned);
        let isReturnWindowOver =
          item?.return_due_date === 0
            ? true
            : moment().isAfter(moment.unix(item?.return_due_date));
        if (item?.return_due_date == undefined) {
          isReturnWindowOver = false;
        }
        if (allowedReturnQty > 0 && !isReturnWindowOver) {
          const finalItem = item;
          // Not sure why allowed_return_qty was injected here. Suppressing Typescript Error
          (finalItem as any).allowed_return_qty = allowedReturnQty;
          setAvailableReturnItems(availableReturnItems => [
            ...availableReturnItems,
            finalItem,
          ]);
        }
        if (isReturnWindowOver) {
          const finalItem = item;
          setReturnWindowExpiredItems(expiredItems => [
            ...expiredItems,
            finalItem,
          ]);
        }
      });

    if (rOrders.length > 0) setReturnOrders(rOrders);
    setLoading(false);
  };

  const cancel = order => {
    const action = () => {
      reject(order);
    };
    dispatch(
      AppActions.switchModal(ModalName.CONFIRM, {
        action: action,
        message: 'Are you sure you want to cancel the order!',
      })
    );
  };

  const cancelledItems = [];
  const normalItems = [];
  for (const item of order.items) {
    if (item.status == OrderItemStatus.CANCELLED) {
      cancelledItems.push(item);
    } else {
      normalItems.push(item);
    }
  }

  const handlePrint = () => {
    Analytics.trackEvent(Event.PRINT_RECEIPT_FROM_ORDER_PAGE, {
      order_id: order.id,
    });
    window.print();
  };

  return (
    <>
      <div className="grid gutter-between">
        <div>{order.ref_id}</div>
        <div>
          {order.status == OrderStatus.CANCELLED && (
            <span className="tag bg-red">
              {order.mallOrder ? order.display_status : 'cancelled'}
            </span>
          )}
          {order.status == OrderStatus.PENDING && (
            <span className="tag bg-yellow">
              {order.mallOrder ? order.display_status : 'pending'}
            </span>
          )}
          {order.status == OrderStatus.CONFIRMED && (
            <span className="tag bg-blue-dark">
              {order.mallOrder ? order.display_status : 'confirmed'}
            </span>
          )}
          {order.status == OrderStatus.FULFILLED && (
            <div className="semi-bold">Invoice No: {order.invoice_number}</div>
          )}
          {order.status == OrderStatus.HOLD && (
            <span className="tag bg-orange">
              {order.mallOrder ? order.display_status : 'hold'}
            </span>
          )}
        </div>
      </div>

      <div className="grid gutter-between mt-xs">
        <div className="md bold mt-xs">{formatCurrency(order.total)}</div>
        {order.customer && (
          <div className="right">
            <div>
              <i className="fas fa-user-tag"></i> {order.customer.mobile}
            </div>
            <div>
              {(order.customer.first_name || '') +
                ' ' +
                (order.customer.last_name || '')}
            </div>
          </div>
        )}
      </div>
      <div className="mt-xs">
        {moment.unix(order.created_at).format('Do MMM YYYY hh:mm A')}
      </div>
      {/* <div className="mt-xs">{order.time}</div> */}
      {order.payments.length > 0 && (
        <div className="mt-xs">
          {/* <span className="tag">Paid</span> */}
          {order.balance <= 0 && <span className="tag mr-xs">Paid</span>}
          {order.balance > 0 && (
            <span className="tag bg-red mr-xs">Unpaid</span>
          )}
          {order.type == PriceType.WHOLESALE && (
            <span className="tag bg-blue-dark white">Wholesale</span>
          )}
          {order.mallOrder ? (
            <img
              src="/images/1kmall-logo.png"
              height="16px"
              className="ph-sm"
              alt="1K Mall"
            />
          ) : null}
        </div>
      )}
      {order.note !== null && (
        <div className="mt-xs">
          <span className="bold">Note: </span>
          {order.note}
        </div>
      )}
      {order.payments.length === 0 && order.subtotal - order.discount !== 0 && (
        <div className="mt-xs">
          <span className="tag bg-red">Unpaid</span>
        </div>
      )}
      {order.subtotal - order.discount === 0 && (
        <div className="mt-xs">
          <span className="tag mr-xs">Paid</span>
        </div>
      )}
      {order.status == OrderStatus.PENDING && !order.mallOrder && (
        <div className="grid gutter-md mt-lg">
          <div className="col-8">
            <button
              className="btn btn-green w-full"
              onClick={() => accept(order)}
            >
              Accept
            </button>
          </div>
          <div className="col-4">
            <button
              className="btn btn-red w-full"
              onClick={() => cancel(order)}
            >
              Reject
            </button>
          </div>
        </div>
      )}
      {order.status == OrderStatus.CONFIRMED && (
        <button
          className="btn btn-green w-full mt-lg"
          onClick={() => accept(order)}
        >
          Finalize
        </button>
      )}
      {order.status == OrderStatus.FULFILLED && (
        <>
          <div className="grid gutter-between mt-md gutter-md">
            {order.total > 0 && (
              <div className="col-6">
                <button
                  className="btn w-full"
                  disabled={loading}
                  onClick={showReturnModal}
                >
                  Return Items
                </button>
              </div>
            )}

            <div className={order.total > 0 ? 'col-6' : 'col-12'}>
              <button className="btn btn-orange w-full" onClick={handlePrint}>
                Print Receipt
              </button>
            </div>
          </div>

          {loading && <div>Loading ....</div>}
          {!loading && returnOrders && (
            <>
              <hr className="hr light mt-md" />
              <div className="mt-md">
                <div className="semi-bold red">
                  <i className="fas fa-exchange-alt"></i> Returns
                </div>
                <ReturnItemList returnOrders={returnOrders} />
              </div>
            </>
          )}
          {!loading && returnReason && (
            <>
              <hr className="hr light mt-md" />
              <div className="mt-md">
                <span className="semi-bold">Return Reason:</span> {returnReason}
              </div>
            </>
          )}
        </>
      )}
      {order.shipping_address && (
        <>
          <hr className="hr light mt-md" />
          <div className="mt-md">
            <div className="semi-bold">
              <i className="fas fa-map-marker-alt"></i> Address
            </div>
            <div className="mt-xs">
              {OrderHelper.getAddressLine(order.shipping_address)}, <br />
              {order.shipping_address.city}, {order.shipping_address.state} -{' '}
              {order.shipping_address.pincode}
            </div>
          </div>
        </>
      )}
      {order.source == 'customer' && (
        <>
          <hr className="hr light mt-md" />
          <div className="mt-md semi-bold">
            <i className="fas fa-truck"></i> Delivery Mode
            <div className="mt-xs bold">
              <span className="upper tag bg-blue">{order.delivery_mode}</span>
            </div>
          </div>
        </>
      )}
      {order.payments.length > 0 && (
        <>
          <hr className="hr light mt-md" />
          <div className="mt-md">
            <div className="semi-bold">
              <i className="fas fa-rupee-sign"></i> Payments
            </div>
            {order.payments.map((payment: Payment, index: number) => {
              return (
                <div
                  key={payment.method + payment.value}
                  className="grid gutter-sm mt-sm"
                >
                  <div>#{++index}</div>
                  <div className="upper col grow">
                    {payment.method === 'points'
                      ? `${payment.method} (in rupees)`
                      : payment.method}{' '}
                    {payment.value < 0 ? '(Refund)' : ''}
                  </div>
                  <div className="right">{formatCurrency(payment.value)}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
      <hr className="hr light mt-md" />
      <div className="mt-md">
        {normalItems.length > 0 && (
          <>
            <div className="semi-bold">
              <i className="fas fa-stream"></i> ITEMS
            </div>
            {normalItems.map(renderOrderItem)}
          </>
        )}
        {cancelledItems.length > 0 && (
          <>
            <div className="semi-bold red mt-md">
              <i className="far fa-window-close"></i> CANCELLED ITEMS
            </div>
            {cancelledItems.map(renderOrderItem)}
          </>
        )}
        {order.balance > 0 && (
          <div className="right mt-sm bold red">
            Due Amount: {formatCurrency(order.balance)}
          </div>
        )}
        <div className="right mt-sm bold">
          Total: {formatCurrency(order.total)}
        </div>
      </div>
      <ReceiptFormat order={order} hidden={true} />
    </>
  );
};

export default OrderDetail;
