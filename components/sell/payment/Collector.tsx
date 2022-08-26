import { useEffect, useState } from 'react';
import Cart from '../../../types/Cart';
import { isInvalid } from '../CartAction';
import { PaymentMethod } from '../../../types/Payment';
import useCart from '../../../hooks/useCart';
import Toolkit from '../../../utils/Toolkit';

interface Props {
  cart: Cart;
  receivePayment: (method: PaymentMethod, value: number) => any;
}

const getPaymentMethods = (cart: Cart) => {
  if (cart.balance < 0) {
    return [PaymentMethod.CASH, PaymentMethod.UPI];
  } else {
    return [PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.UPI];
  }
};

const Collector = ({ cart, receivePayment }: Props) => {
  const [value, setValue] = useState(cart.balance.toString());
  useEffect(() => {
    setValue(cart.balance.toString());
  }, [cart.balance]);
  const parsedValue = parseFloat(value);

  const { collectRefundPayment } = useCart();

  const collect = (method: PaymentMethod) => {
    if (parsedValue) {
      receivePayment(method, parsedValue);
    }
  };

  const collectMultiplePayments = () => {
    collectRefundPayment();
  };
  return (
    <>
      <div className="grid gutter-md c-center">
        <div className="col-6 lg semi-bold">
          Amount To {cart.balance < 0 ? 'Refund' : 'Pay'}
        </div>
        <div className="col-6">
          <input
            className="input amount"
            type="text"
            value={value}
            onFocus={e => e.target.setSelectionRange(0, e.target.value.length)}
            onChange={e => setValue(e.target.value)}
            disabled={
              cart.balance < 0 || cart.refundPayments?.length ? true : false
            }
          />
        </div>
      </div>
      <div className="xs amount-msg">
        {parsedValue == cart.balance &&
          cart.balance > 0 &&
          'Edit to make a partial payment'}
        {cart.balance - parsedValue > 0 &&
          `\u20B9 ${cart.balance - parsedValue} more to receive`}
        {cart.balance - parsedValue < 0 &&
          `Return Back \u20B9 ${Math.abs(cart.balance - parsedValue)}`}
      </div>

      {cart?.refundPayments?.length > 0 ? (
        <>
          <div className="grid gutter-md pv-md semi-bold">
            {cart.refundPayments.map(payment => (
              <>
                <div className="col-6" style={{ textTransform: 'capitalize' }}>
                  {payment.method}(REFUND)
                </div>
                <div className="col-6 right">
                  {Toolkit.round(payment.value, 0)}
                </div>
              </>
            ))}
          </div>
          <button
            disabled={isInvalid(cart)}
            className="btn btn-orange w-full"
            onClick={collectMultiplePayments}
          >
            Confirm
          </button>
        </>
      ) : (
        <div className="mt-xl grid gutter-md">
          {getPaymentMethods(cart).map(method => {
            return (
              <div className="col-12 col-sm-6" key={method + value}>
                <button
                  className="btn btn-orange w-full btn-lg upper"
                  onClick={() => collect(method)}
                  disabled={isInvalid(cart)}
                >
                  {method}
                </button>
              </div>
            );
          })}
          <div className="col-12 col-sm-6">
            <button className="btn btn-orange w-full btn-lg" disabled={true}>
              Loyalty Points
            </button>
          </div>
          <div className="col-12 col-sm-6">
            <button className="btn btn-orange w-full btn-lg" disabled={true}>
              Account Credit
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Collector;
