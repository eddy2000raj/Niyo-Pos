import React from 'react';
import Page from '../layouts/Page';
import usePayments from '../hooks/usePayments';
import Success from '../components/Success';
import TransactionTable from '../components/payments/TransactionTable';
import OnlinePaymentBenefits from '../components/payments/OnlinePaymentBenefits';
import useStorageScheduler from '../hooks/useStoargeScheduler';

const PayPage = () => {
  useStorageScheduler();
  const {
    displayRazorpay,
    loadingRazorpay,
    paymentSuccess,
    amount,
    setAmount,
    dueAmount,
    loadingDueAmount,
  } = usePayments();
  const initiatePayment = async e => {
    e.preventDefault();
    await displayRazorpay(parseFloat(amount));
  };

  return (
    <Page>
      {paymentSuccess ? (
        <Success type={'Payment'} />
      ) : (
        <>
          <h1 className="lg bold">
            Pay Online
            <span className="md">
              {' '}
              (आपको यहाँ बस &lsquo; Weekly Sales &rsquo; का पेमेंट करना है। किसी
              और चीज़ का पेमेंट ना करे!)
            </span>
          </h1>
          <div className="grid gutter-between gutter-sm col grow mt-md">
            <div className="col-12">
              <div className="grid gutter-sm">
                <form onSubmit={initiatePayment} className="col-3">
                  <div className="label bold ms red mr0">
                    Due Amount : <i className="fas fa-rupee-sign"></i>{' '}
                    {loadingDueAmount ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      dueAmount
                    )}{' '}
                  </div>{' '}
                  <br />
                  <label className="label bold ms">Enter Amount</label>
                  <div className="input-group">
                    <div className="icon">
                      <i className="fas fa-rupee-sign"></i>
                    </div>
                    <input
                      className="input input-sm"
                      value={amount || ''}
                      placeholder="amount"
                      type="number"
                      min="1"
                      onChange={e => setAmount(e.target.value)}
                    />
                  </div>
                  <br />
                  <button
                    disabled={
                      amount === '' ||
                      parseFloat(amount) <= 0 ||
                      parseFloat(amount) > 500000
                    }
                    className="btn btn-md btn-green w-full btn-bordered-default"
                    type="submit"
                  >
                    {loadingRazorpay ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      'PAY NOW'
                    )}
                  </button>
                </form>
                <div className="col-9">
                  <OnlinePaymentBenefits />
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="grid">
                <div className="col-12">
                  <TransactionTable />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Page>
  );
};

export default PayPage;
