import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Page from '../layouts/Page';
import { RootState } from '../redux/store';
import Toolkit from '../utils/Toolkit';
import DashboardApi from '../apis/DashboardApi';
import moment from 'moment';
import { DateRangePicker, isInclusivelyBeforeDay } from 'react-dates';
import AppAction from '../redux/actions/AppAction';
import { ModalName } from '../types/Modal';
import ReportsApi from '../apis/gateway/ReportsApi';
import Storage, { StorageKey } from '../utils/Storage';
import ReportCard from '../components/ReportCard';
import useNetwork from '../hooks/useNetwork';

enum SALES_DURATION {
  TODAY = 'Today',
  THIS_WEEK = 'This Week',
  CHOOSE_DATES = 'Choose Dates',
}

enum INCOME_DURATION {
  TODAY = 'Today',
  THIS_WEEK = 'This Week',
  THIS_MONTH = 'This Month',
}

const getDiscountPercentage = (stats: any) => {
  if (stats.sale) {
    return Toolkit.round(
      (stats.discount / (stats.sale + stats.discount)) * 100,
      2
    );
  }

  return 0;
};
const IndexPage = () => {
  const [salesDateRange, setSalesDateRange] = useState({
    startDate: moment().startOf('day').unix(),
    endDate: moment().endOf('day').unix(),
  });
  const [incomeDateRange, setIncomeDateRange] = useState({
    startDate: moment().startOf('day').format('YYYY-MM-DD'),
    endDate: moment().endOf('day').format('YYYY-MM-DD'),
  });
  const [stats, setStats] = useState(null);
  const rootState = useSelector((state: RootState) => state);
  const apiProps = Toolkit.mapStateToApiProps(rootState);
  const [focussedPickerSale, setFocussedPickerSale] = useState(null);
  const [focussedPickerIncome, setFocussedPickerIncome] = useState(null);
  const [activeSaleTag, setActiveSaleTag] = useState(SALES_DURATION.TODAY);
  const [activeIncomeTag, setActiveIncomeTag] = useState(INCOME_DURATION.TODAY);
  const dispatch = useDispatch();
  const [data, setData] = useState(null);

  const [incomeData, setIncomeData] = useState(null);

  const isOnline = useNetwork();

  const fetchStats = async apiProps => {
    const params = {
      fromDate: salesDateRange.startDate,
      toDate: salesDateRange.endDate,
    };
    const response = await new DashboardApi(apiProps).stats(params);
    setStats(response.data);
  };

  const fetchIncomeData = async () => {
    setIncomeData(null);
    const params = {
      fromDate: incomeDateRange.startDate,
      toDate: incomeDateRange.endDate,
    };
    const token = Storage.get(StorageKey.TOKEN_GATEWAY, null);
    const response = await new ReportsApi(token).getIncomeData(params);
    setIncomeData(response);
    setData(response.data);
  };

  useEffect(() => {
    fetchIncomeData();
  }, [incomeDateRange]);

  const spinner = () => {
    return <i className="fas fa-spinner fa-spin"></i>;
  };

  useEffect(() => {
    fetchStats(apiProps);
    return () => {
      setStats(null);
    };
  }, [salesDateRange]);

  const onSalesDateRangeChange = ({ startDate, endDate }) => {
    if (!(startDate && endDate)) return;
    if (startDate.unix() === endDate.unix()) {
      startDate = moment(startDate).startOf('day');
      endDate = moment(endDate).endOf('day');
    }
    setSalesDateRange({
      startDate: startDate.unix(),
      endDate: endDate.unix(),
    });
  };
  const onIncomeDateRangeChange = ({ startDate, endDate }) => {
    if (!(startDate && endDate)) return;
    if (startDate === endDate) {
      startDate = moment(startDate).startOf('day');
      endDate = moment(endDate).endOf('day');
    }
    setIncomeDateRange({
      startDate: moment(startDate).format('YYYY-MM-DD'),
      endDate: moment(endDate).format('YYYY-MM-DD'),
    });
  };

  const openModal = modalName => {
    dispatch(AppAction.switchModal(modalName));
  };

  const handleSalesSummary = time => {
    setActiveSaleTag(time);
    if (time == SALES_DURATION.TODAY) {
      return setSalesDateRange({
        startDate: moment().startOf('day').unix(),
        endDate: moment().startOf('day').unix(),
      });
    }
    if (time == SALES_DURATION.THIS_WEEK) {
      return setSalesDateRange({
        startDate: moment().startOf('week').unix(),
        endDate: moment().startOf('day').unix(),
      });
    }
    if (time == SALES_DURATION.CHOOSE_DATES) {
      return;
    }
  };

  const handleIncomesSummary = time => {
    setActiveIncomeTag(time);
    if (time == INCOME_DURATION.TODAY) {
      return setIncomeDateRange({
        startDate: moment().format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD'),
      });
    }
    if (time == INCOME_DURATION.THIS_WEEK) {
      return setIncomeDateRange({
        startDate: moment().startOf('week').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD'),
      });
    }
    if (time == INCOME_DURATION.THIS_MONTH) {
      return setIncomeDateRange({
        startDate: moment().startOf('month').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD'),
      });
    }
  };

  return (
    <Page>
      {isOnline ? (
        <div>
          <div className="grid gutter-between">
            <p className="black semi-bold">STORE SALES SUMMARY</p>
            <div className="grid right">
              {Object.keys(SALES_DURATION).map((timeTag, i) => (
                <div key={i}>
                  <button
                    className={`${
                      activeSaleTag == SALES_DURATION[timeTag]
                        ? 'btn-black'
                        : ''
                    } btn btn-sm`}
                    style={{ borderRadius: '5px', width: '130px' }}
                    onClick={() => handleSalesSummary(SALES_DURATION[timeTag])}
                  >
                    {SALES_DURATION[timeTag]}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="right mt-sm w-full">
            <DateRangePicker
              small
              displayFormat="Do MMM"
              startDate={moment.unix(salesDateRange.startDate)}
              startDateId="orders-datepicker-start"
              endDate={moment.unix(salesDateRange.endDate)}
              endDateId="orders-datepicker-end"
              onDatesChange={onSalesDateRangeChange}
              focusedInput={focussedPickerSale}
              onFocusChange={focusedInput =>
                setFocussedPickerSale(focusedInput)
              }
              isOutsideRange={day => !isInclusivelyBeforeDay(day, moment())}
              minimumNights={0}
              readOnly
              disabled={
                activeSaleTag === SALES_DURATION.TODAY ||
                activeSaleTag === SALES_DURATION.THIS_WEEK
              }
            />
          </div>
          <div className="card p-lg mt-sm">
            <div className="grid gutter-md">
              <ReportCard
                star={false}
                img="rupee.png"
                topText="SALE"
                bottomText={
                  stats ? Toolkit.formatCurrency(stats.sale) : spinner()
                }
                cols="col-12 col-xs-6 col-md-3 col-sm-4"
              />
              <ReportCard
                star={false}
                img="discount.png"
                topText="DISCOUNT"
                bottomText={
                  stats
                    ? Toolkit.formatCurrency(stats.discount, true, 0)
                    : spinner()
                }
                cols="col-12 col-xs-6 col-md-3 col-sm-4"
              />
              <ReportCard
                star={false}
                img="orders.png"
                topText="ORDERS"
                bottomText={stats ? stats.order_count : spinner()}
                cols=" col-12 col-xs-6 col-md-3 col-sm-4"
              />
              <ReportCard
                star={false}
                img="customers.png"
                topText="CUSTOMERS"
                bottomText={stats ? stats.customers : spinner()}
                cols="col-12 col-xs-6 col-md-3 col-sm-4"
              />
            </div>
          </div>
          <div className="card p-lg mt-sm">
            <div className="grid gutter-md center">
              <ReportCard
                star={false}
                img="app_orders.png"
                topText="APP ORDERS"
                bottomText={stats ? stats.app_orders : spinner()}
                cols="col-12 col-xs-6 col-md-3 col-sm-4"
              />
              <ReportCard
                star={false}
                img="rupee.png"
                topText="APP ORDER SALE"
                bottomText={
                  stats
                    ? Toolkit.formatCurrency(stats.app_orders_sale, true, 0)
                    : spinner()
                }
                cols="col-12 col-xs-6 col-md-3 col-sm-4"
              />
              <ReportCard
                star={false}
                img="online_payment.png"
                topText="ONLINE PAYMENT"
                bottomText={
                  stats
                    ? Toolkit.formatCurrency(stats.online_payments, true, 0)
                    : spinner()
                }
                cols="col-12 col-xs-6 col-md-3 col-sm-4"
              />
              <ReportCard
                star={false}
                img="loyality_payment.png"
                topText="LOYALTY PAYMENT"
                bottomText={
                  stats
                    ? Toolkit.formatCurrency(stats.loyalty_payments, true, 0)
                    : spinner()
                }
                cols="col-12 col-xs-6 col-md-3 col-sm-4"
              />
            </div>
          </div>

          <div className="grid gutter-between mt-sm">
            <p className="black semi-bold">STORE INCOME SUMMARY</p>
            <div className="grid right">
              {Object.keys(INCOME_DURATION).map((timeTag, i) => (
                <div key={i}>
                  <button
                    className={`${
                      activeIncomeTag == INCOME_DURATION[timeTag]
                        ? 'btn-black'
                        : ''
                    } btn btn-sm`}
                    style={{ borderRadius: '5px', width: '130px' }}
                    onClick={() =>
                      handleIncomesSummary(INCOME_DURATION[timeTag])
                    }
                  >
                    {INCOME_DURATION[timeTag]}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="right mt-sm">
            <DateRangePicker
              small
              displayFormat="Do MMM"
              isOutsideRange={day => !isInclusivelyBeforeDay(day, moment())}
              startDate={moment(incomeDateRange.startDate)}
              startDateId="orders-datepicker-start"
              endDate={moment(incomeDateRange.endDate)}
              endDateId="orders-datepicker-end"
              onDatesChange={onIncomeDateRangeChange}
              focusedInput={focussedPickerIncome}
              onFocusChange={focusedInput =>
                setFocussedPickerIncome(focusedInput)
              }
              minimumNights={0}
              readOnly
              disabled={true}
            />
          </div>
          <div className="flex mt-sm" style={{ gap: '10px' }}>
            <div className="card p-lg" style={{ flex: 0.25 }}>
              <ReportCard
                star={false}
                img="store_income.png"
                topText="STORE INCOME"
                bottomText={
                  incomeData
                    ? Toolkit.formatCurrency(incomeData.total, true, 0)
                    : spinner()
                }
                cols=" col-xs-6 col-md-13 col-sm-13 col-lg-13"
              />
            </div>
            <div
              className="card p-lg flex"
              style={{ flex: 0.75, justifyContent: 'space-around' }}
            >
              <ReportCard
                star={true}
                img="commissions.png"
                topText="Commissions"
                bottomText={
                  incomeData
                    ? Toolkit.formatCurrency(
                        incomeData.commissions.total_commission,
                        true,
                        0
                      )
                    : spinner()
                }
                cols=""
              />
              <ReportCard
                star={false}
                img="reimbursements.png"
                topText="Reimbursements"
                bottomText={
                  incomeData
                    ? Toolkit.formatCurrency(
                        incomeData.reimbursements.reimbursements,
                        true,
                        0
                      )
                    : spinner()
                }
                cols=""
              />
              <ReportCard
                star={false}
                img="incentives.png"
                topText="Incentives"
                bottomText={
                  incomeData
                    ? Toolkit.formatCurrency(
                        incomeData.incentives.incentives,
                        true,
                        0
                      )
                    : spinner()
                }
                cols=""
              />
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
          <div
            className="flex mt-sm"
            style={{ justifyContent: 'space-between' }}
          >
            <p
              onClick={() => openModal(ModalName.REPORTS_TNC)}
              className="blue pointer"
            >
              Terms & Conditions *
            </p>
            <p
              onClick={() => openModal(ModalName.COMMISSION)}
              className="blue pointer "
            >
              How do we calculate your store Commissions?
            </p>
          </div>

          {/* <p className="black semi-bold">STORE SALES COLLECTION SUMMARY</p>
      
      <div
        className="card flex mt-md"
        style={{ justifyContent: 'space-around', alignItems: "center" }}
      >
        {DetailCard('dues.png', 'SALE', '₹ 4,418')}
        <img src="/images/reports/arrow_img.png" height="80px" />
        {DetailCard('dues.png', 'SALE', '₹ 4,418')}
        {DetailCard('dues.png', 'SALE', '₹ 4,418')}
        {DetailCard('dues.png', 'SALE', '₹ 4,418')}
        <button className='btn btn-black btn-md'>Pay Now</button>
      </div>
      <p
        onClick={() => openModal(ModalName.COLLECTION)}
        className="right mt-sm blue pointer"
      >
        How do we calculate Sales Collection?
      </p> */}
        </div>
      ) : (
        <div
          className="red p-lg center"
          style={{
            border: '2px solid var(--color-red-dark)',
            margin: '0 auto',
          }}
        >
          <p className="lg red">
            Please go online to see the reprots panel. <br /> रिप्रोट पैनल देखने
            के लिए कृपया ऑनलाइन जाएं।
          </p>
        </div>
      )}
    </Page>
  );
};

export default IndexPage;
