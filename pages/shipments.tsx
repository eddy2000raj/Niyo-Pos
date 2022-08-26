import Page from '../layouts/Page';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DateRangePicker, isInclusivelyBeforeDay } from 'react-dates';
import moment from 'moment';
import useShipments, {
  SHIPMENT_PURCHASE,
  SHIPMENT_RETURN,
} from '../hooks/useShipments';
import ListItem from '../components/shipments/ListItem';
import ListItemDetail from '../components/shipments/ListItemDetail';
import AppAction from '../redux/actions/AppAction';

const mapRootState = rootState => {
  return { shipmentsPageUISettings: rootState.appState.ui.shipments };
};

const ShipmentPage = () => {
  const { shipmentsPageUISettings } = useSelector(mapRootState);
  const initialPage = 1;
  const minDate = moment().subtract(3, 'months').startOf('month');
  const {
    results,
    dateRange,
    setDateRange,
    page,
    setPage,
    loading,
    hasMore,
    type,
    setType,
  } = useShipments(
    initialPage,
    moment.unix(shipmentsPageUISettings.startDate),
    moment.unix(shipmentsPageUISettings.endDate)
  );
  const itemsRef = useRef<HTMLDivElement>(null);
  const [shipment, setShipment] = useState(null);
  const [focussedPicker, setFocussedPicker] = useState(null);
  const dispatch = useDispatch();

  const onDateRangeChange = ({ startDate, endDate }) => {
    setDateRange({ startDate, endDate });
    startDate &&
      endDate &&
      dispatch(
        AppAction.updateShipmentsDateRange(startDate.unix(), endDate.unix())
      );
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
            setPage(page => page + 1);
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
            <div className="grid gutter-between c-center mt-md">
              <h1 className="lg bold">SHIPMENTS</h1>
              <DateRangePicker
                small
                displayFormat="Do MMM"
                startDate={dateRange.startDate}
                startDateId="orders-datepicker-start"
                endDate={dateRange.endDate}
                minDate={minDate}
                isOutsideRange={day => !isInclusivelyBeforeDay(day, moment())}
                endDateId="orders-datepicker-end"
                onDatesChange={onDateRangeChange}
                focusedInput={focussedPicker}
                onFocusChange={focusedInput => setFocussedPicker(focusedInput)}
                minimumNights={0}
                readOnly
              />
              <div className="grid right">
                <div>
                  <button
                    className={`${
                      type == SHIPMENT_PURCHASE ? 'btn-yellow' : ''
                    } btn btn-sm`}
                    onClick={() => setType(SHIPMENT_PURCHASE)}
                  >
                    Purchase
                  </button>
                </div>
                <div>
                  <button
                    className={`${
                      type == SHIPMENT_RETURN ? 'btn-yellow' : ''
                    } btn btn-sm`}
                    onClick={() => setType(SHIPMENT_RETURN)}
                  >
                    Returns
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-xs col grow items" ref={itemsRef}>
              <div className="mt-md">
                {results.length
                  ? !(loading && page == 1) &&
                    results.map(item => (
                      <ListItem
                        item={item}
                        select={setShipment}
                        key={item.id}
                        isActive={item == shipment}
                      />
                    ))
                  : 'No Results Found! Please try different filter.'}
              </div>
              <div className="center mt-md">
                {loading && <i className="fas fa-sync fa-spin"></i>}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 flex">
          <div className="flex vertical col grow">
            {shipment && <ListItemDetail shipment={shipment} />}
          </div>
        </div>
      </div>
    </Page>
  );
};

export default ShipmentPage;
