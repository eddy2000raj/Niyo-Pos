import Page from '../layouts/Page';
import React, { useEffect, useRef, useState } from 'react';
import OrderDetail from '../components/orders/OrderDetail';
import OrderListItem from '../components/orders/OrderListItem';
import useOrders from '../hooks/useOrders';
import moment from 'moment';
import { DateRangePicker, isInclusivelyBeforeDay } from 'react-dates';
import Order, {
  OrderSource,
  OrderStatus,
  OrderStatusColor,
} from '../types/Order';
import { useRouter } from 'next/router';
import useCart from '../hooks/useCart';
import { useSelector, useDispatch } from 'react-redux';
import OrderAction from '../redux/actions/OrderAction';
import { PriceType } from '../types/Product';
import AppAction from '../redux/actions/AppAction';

const OrderQueryFilters = [
  {
    label: 'app',
    attribute: 'source',
    value: OrderSource.CUSTOMER,
  },
  {
    label: 'mall',
    attribute: 'mall',
    value: true,
  },
  {
    label: 'wholesale',
    attribute: 'type',
    value: PriceType.WHOLESALE,
  },
];

const mapRootState = rootState => {
  return { ordersPageUISettings: rootState.appState.ui.orders };
};
const orderStatus = [
  {
    label: 'PENDING',
    status: OrderStatus.PENDING,
  },
  {
    label: 'COMPLETED',
    status: OrderStatus.FULFILLED,
  },
];

const OrderPage = () => {
  const { ordersPageUISettings } = useSelector(mapRootState);
  const initialQuery = {
    page: 1,
    limit: 10,
    keyword: '',
    status: null,
    source: null,
    startDate: ordersPageUISettings.startDate,
    endDate: ordersPageUISettings.endDate,
  };

  const minDate = moment().subtract(3, 'months').startOf('month').unix();
  const { orders, query, setQuery, loading, hasMore, setOrders } =
    useOrders(initialQuery);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const [focussedPicker, setFocussedPicker] = useState(null);
  const [filterType, setFilterType] = useState('');
  const { loadOrder } = useCart();
  const dispatch = useDispatch();
  const router = useRouter();

  const accept = async (order: Order) => {
    await loadOrder(order);
    router.push('/');
  };

  const reject = async (order: Order) => {
    if (order.display_status) {
      order.display_status = 'Order Cancelled';
    }
    const updatedOrder: Order = (await dispatch(
      OrderAction.cancel(order)
    )) as any;
    if (selectedOrder.id == updatedOrder.id) {
      setSelectedOrder(updatedOrder);
    }
    const updatedOrders = orders.map(order =>
      updatedOrder.id == order.id ? updatedOrder : order
    );
    setOrders(updatedOrders);
  };

  const onDateRangeChange = ({ startDate, endDate }) => {
    if (!(startDate && endDate)) return;
    const newQuery = { ...query, page: 1 };
    if (startDate) {
      newQuery.startDate = startDate.unix();
    }
    if (endDate) {
      newQuery.endDate = endDate.unix();
    }
    dispatch(AppAction.updateOrdersDateRange(startDate.unix(), endDate.unix()));
    setQuery(newQuery);
  };

  const onStatusChange = (status: OrderStatus) => {
    setQuery({ ...query, status, page: 1 });
  };

  const onTypeChange = (type: string) => {
    setFilterType(type);
    const queryFilters = { source: null, mall: false, type: null };
    if (type) {
      const filter = OrderQueryFilters.filter(obj => obj.label == type);
      const attr = filter[0].attribute;
      queryFilters[`${attr}`] = filter[0].value;
    }
    setQuery({ ...query, ...queryFilters, page: 1 });
  };

  useEffect(() => {
    if (!loading && hasMore) {
      let isExecuted = false;
      itemsRef.current.onscroll = () => {
        if (!isExecuted) {
          const scrollHeight = itemsRef.current.scrollHeight;
          const visibleHeight = itemsRef.current.offsetHeight;
          const neededOffset = 200;
          if (
            itemsRef.current.scrollTop + neededOffset >
            scrollHeight - visibleHeight
          ) {
            isExecuted = true;
            setQuery({ ...query, page: query.page + 1 });
          }
        }
      };
    }
    const itemsCurrent = itemsRef.current;
    return () => {
      if (itemsCurrent) itemsCurrent.onscroll = null;
    };
  }, [loading, hasMore]);

  return (
    <Page>
      <div className="grid gutter-between gutter-sm col grow">
        <div className="col-12 col-sm-6 flex">
          <div className="grid vertical col grow">
            <div className="grid gutter-between">
              <div>
                <div className="btn-group btn-group-sm xs btn-group-orange col">
                  {OrderQueryFilters.map((filter, index) => {
                    return (
                      <button
                        key={index}
                        className={`upper ${
                          filterType === filter.label ? 'active' : ''
                        }`}
                        onClick={() =>
                          onTypeChange(
                            filter.label === filterType ? '' : filter.label
                          )
                        }
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
                <h1 className="lg bold mt-xs">Orders</h1>
              </div>
              <div>
                <DateRangePicker
                  small
                  displayFormat="Do MMM"
                  startDate={moment.unix(query.startDate)}
                  startDateId="orders-datepicker-start"
                  endDate={moment.unix(query.endDate)}
                  minDate={moment.unix(minDate)}
                  isOutsideRange={day => !isInclusivelyBeforeDay(day, moment())}
                  endDateId="orders-datepicker-end"
                  onDatesChange={onDateRangeChange}
                  focusedInput={focussedPicker}
                  onFocusChange={focusedInput =>
                    setFocussedPicker(focusedInput)
                  }
                  minimumNights={0}
                  readOnly
                />
              </div>
            </div>

            <div className="grid gutter-sm mt-xs">
              {orderStatus.map(({ status, label }, index) => {
                return (
                  <div key={index} className="col-6">
                    <button
                      className={`pointer btn btn-xs w-full btn-bordered-default upper ${
                        query.status === status ? OrderStatusColor[status] : ''
                      } `}
                      onClick={() =>
                        onStatusChange(status === query.status ? null : status)
                      }
                    >
                      {label}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="input-group mt-xs">
              <div className="icon">
                <i className="fas fa-search"></i>
              </div>
              <input
                className="input input-sm"
                value={query.keyword}
                placeholder="Search by invoice, ref_id, customer name or mobile number "
                onChange={e =>
                  setQuery({ ...query, page: 1, keyword: e.target.value })
                }
              />
            </div>

            <div className="col grow orders mt-sm" ref={itemsRef}>
              {!(loading && query.page == 1) &&
                orders.map(order => (
                  <OrderListItem
                    key={order.id}
                    order={order}
                    select={setSelectedOrder}
                    isActive={order == selectedOrder}
                  />
                ))}
              {!loading && orders.length == 0 && (
                <p className="sm">
                  No matching orders found. Please try a different filter.
                </p>
              )}
              <div className="center mt-sm">
                {loading && <i className="fas fa-sync fa-spin"></i>}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 flex">
          <div className="flex vertical col grow">
            <div className="xs order-details col grow p-md card">
              {selectedOrder && (
                <OrderDetail
                  order={selectedOrder}
                  accept={accept}
                  reject={reject}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default OrderPage;
