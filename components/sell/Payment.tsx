import React from 'react';
import useCart from '../../hooks/useCart';
import CustomerSearch from './CustomerSearch';
import { errorBar } from './CartAction';
import Completer from './payment/Completer';
import Collector from './payment/Collector';
import Summary from './payment/Summary';

const Payment = ({ moveToCart, complete }) => {
  const { cart, addPayment, removePayment } = useCart();

  return (
    <div className="grid gutter-md h-full step-payment mt-md">
      <div className="col-12 col-sm-6 cart">
        <div className="cart-body">
          <div className="grid c-center">
            <div onClick={() => moveToCart()} className="pointer">
              <i className="fas fa-chevron-left mr-md"></i>
            </div>
            <span className="xl">Sale</span>
          </div>
          <Summary cart={cart} removePayment={removePayment} />
        </div>
      </div>
      <div className="col-12 col-sm-6 h-full">
        <div className="card p-xl h-full">
          <CustomerSearch />
          <div>{errorBar(cart)}</div>
          <div className="mt-lg">
            {cart.balance != 0 && (
              <Collector cart={cart} receivePayment={addPayment} />
            )}
            {cart.balance == 0 && <Completer cart={cart} complete={complete} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
