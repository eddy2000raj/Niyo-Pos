import moment from 'moment';
import Order, { OrderStatus } from '../../types/Order';
import { formatCurrency } from '../../utils/Toolkit';
import { PriceType } from '../../types/Product';

interface Props {
  order: Order;
  isActive: boolean;
  select: (order: Order) => any;
}

const OrderListItem = ({ order, select, isActive }: Props) => {
  return (
    <div
      className={`${
        isActive ? 'active' : ''
      } card bg-white p-md mt-sm order xs pointer ${
        order.synced == 0 ? 'sync-error' : ''
      }`}
      onClick={() => select(order)}
    >
      <div className="grid gutter-between">
        <div className="flex c-center">
          {order.ref_id}{' '}
          {order.invoice_number ? '/ ' + order.invoice_number : ''}
        </div>
        <div>
          <i className="far fa-clock"></i>&nbsp;
          <span>
            {moment.unix(order.created_at).format('Do MMM YYYY hh:mm A')}
          </span>
        </div>
      </div>
      <div className="grid gutter-between mt-xs">
        <div className="bold sm">{formatCurrency(order.total)}</div>
        <div>Items: {order.items.length}</div>
      </div>
      <div className="grid gutter-between mt-xs">
        <div className="col">
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
        <div className="col">
          {order.status == OrderStatus.CANCELLED && (
            <span className="tag bg-red">
              {order.display_status ? order.display_status : 'cancelled'}
            </span>
          )}
          {order.status == OrderStatus.PENDING && (
            <span className="tag bg-yellow">
              {order.display_status ? order.display_status : 'pending'}
            </span>
          )}
          {order.status == OrderStatus.CONFIRMED && (
            <span className="tag bg-blue-dark">
              {order.display_status ? order.display_status : 'confirmed'}
            </span>
          )}
          {order.status == OrderStatus.FULFILLED && (
            <span className="tag bg-green">
              {order.display_status ? order.display_status : 'fulfilled'}
            </span>
          )}
          {order.status == OrderStatus.HOLD && (
            <span className="tag bg-orange">
              {order.display_status ? order.display_status : 'hold'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderListItem;
