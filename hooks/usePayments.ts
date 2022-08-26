import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import Toolkit from '../utils/Toolkit';
import Router from 'next/router';
import PaymentApi from '../apis/PaymentApi';
import DB from '../utils/database/DB';
import Storage, { StorageKey } from '../utils/Storage';
import moment from 'moment';

const mapRootState = (rootState: RootState) => {
  return { user: rootState.appState.user, rootState: rootState };
};
declare global {
  interface Window {
    Razorpay: any;
  }
}
const loadScript = (source: string) => {
  return new Promise(resolve => {
    const script = document.createElement('script');
    script.src = source;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const usePayments = () => {
  const [loadingRazorpay, setLoadingRazorpay] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransaction, setLoadingTransaction] = useState<boolean>(false);
  const [amount, setAmount] = useState('');
  const [dueAmount, setDueAmount] = useState(null);
  const [loadingDueAmount, setLoadingDueAmount] = useState<boolean>(false);
  const { user, rootState } = useSelector(mapRootState);
  const apiProps = Toolkit.mapStateToApiProps(rootState);

  const updateTimeStamp = () => {
    const lastUpdatedTime = Storage.get(StorageKey.LAST_UPDATED_TIME, {});
    const newUpdatedTime = { ...lastUpdatedTime };
    if (newUpdatedTime['pay'] === undefined) newUpdatedTime['pay'] = {};
    newUpdatedTime['pay']['timestamp'] = [
      moment().format('Do MMM YY, h:mm a'),
      'now',
    ];
    Storage.set(StorageKey.LAST_UPDATED_TIME, newUpdatedTime);
  };

  const loadTransactionData = async () => {
    try {
      setTransactions(
        await DB.transactions.orderBy('created_at').reverse().toArray()
      );
      setLoadingTransaction(true);
      const result = await new PaymentApi(apiProps).getTransactions();
      const newTransactions = result.data.data;
      await DB.transactions.clear();
      await DB.transactions.bulkPut(newTransactions);
      const transactionData = await DB.transactions
        .orderBy('created_at')
        .reverse()
        .toArray();
      setTransactions(transactionData);
      updateTimeStamp();
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingTransaction(false);
    }
  };

  const displayRazorpay = async (amount: number) => {
    setLoadingRazorpay(true);
    try {
      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY)
        throw new Error('Undefined Razorpay Key');

      const res = await loadScript(
        'https://checkout.razorpay.com/v1/checkout.js'
      );
      if (!res) throw new Error('Razorpay SDK failed to load. Are you online?');

      const result = await new PaymentApi(apiProps).initiatePayment({
        amount: amount,
      });
      if (!result) throw new Error('Server error. Are you online?');

      const {
        amount: pay_amount,
        id: order_id,
        currency,
        receipt,
        notes,
      } = result.data.payment.params;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: pay_amount.toString(),
        currency: currency,
        name: '1K Kirana Bazaar',
        description: receipt,
        order_id: order_id,
        handler: async () => {
          setLoadingRazorpay(false);
          setPaymentSuccess(true);
          setTimeout(() => Router.reload(), 1000);
        },
        modal: {
          ondismiss: () => Router.reload(),
        },
        prefill: {
          name: user.store.name,
          email: user.email ? user.email : 'support@1knetworks.com',
          contact: user.store.mobile,
        },
        notes: notes,
      };

      const payment = new window.Razorpay(options);
      payment.open();
      payment.on('payment failed', response => console.error(response));
    } catch (e) {
      console.error(e);
      setLoadingRazorpay(false);
    }
  };

  const fetchDueAmount = async () => {
    try {
      setLoadingDueAmount(true);
      const response = await new PaymentApi(apiProps).getDueAmount();
      setDueAmount(response.data.dueAmount);
      setAmount(response.data.dueAmount);
      if (response.data.dueAmount > 500000) {
        setAmount('500000');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDueAmount(false);
    }
  };

  useEffect(() => {
    fetchDueAmount();
  }, []);

  return {
    displayRazorpay,
    loadingRazorpay,
    paymentSuccess,
    loadingTransaction,
    transactions,
    loadTransactionData,
    amount,
    setAmount,
    dueAmount,
    loadingDueAmount,
  };
};

export default usePayments;
