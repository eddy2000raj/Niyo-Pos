import React from 'react';
import Cart from '../../types/Cart';
import Toolkit from '../../utils/Toolkit';
import { OrderItemStatus } from '../../types/OrderItem';

export const isInvalid = (cart: Cart) => {
  const hasErrorFreeItems = cart.items.every(
    item => Object.entries(item.errors).length === 0
  );
  const hasNoCartErrors = Object.entries(cart.errors).length === 0;
  return (
    !cart.items.length || !cart.total || !hasErrorFreeItems || !hasNoCartErrors
  );
};

export const errorBar = (cart: Cart) => {
  const errors = Object.entries(cart.errors);
  if (errors.length === 0) {
    return null;
  }
  return <div className="bg-red white p-md pv-xs sm">{errors[0][1]}</div>;
};

const CartAction = ({ cart, moveToPayment, markConfirmed }) => {
  const hasPendingItems = cart.items.some(
    item => item.status == OrderItemStatus.PENDING
  );

  if (hasPendingItems) {
    return (
      <>
        {errorBar(cart)}
        <button
          className="btn btn-black w-full btn-lg"
          disabled={isInvalid(cart)}
          onClick={() => markConfirmed()}
        >
          <div className="grid gutter-between c-center">
            <div>
              {cart.total < 0 && <span className="bold mr-sm md">REFUND </span>}
              {cart.total > 0 && (
                <React.Fragment>
                  <span className="bold mr-sm md">CONFIRM </span>
                  <span className="xs">{cart.quantity} items</span>
                </React.Fragment>
              )}
            </div>
            <div className="bold md">{Toolkit.formatCurrency(cart.total)}</div>
          </div>
        </button>
      </>
    );
  } else {
    return (
      <>
        {errorBar(cart)}
        <button
          className="btn btn-orange w-full btn-lg"
          disabled={isInvalid(cart)}
          onClick={() => moveToPayment()}
        >
          <div className="grid gutter-between c-center">
            <div>
              {cart.total < 0 && <span className="bold mr-sm md">REFUND </span>}
              {cart.total > 0 && (
                <React.Fragment>
                  <span className="bold mr-sm md">PAY </span>
                  <span className="xs">{cart.quantity} items</span>
                </React.Fragment>
              )}
            </div>
            <div className="bold md">{Toolkit.formatCurrency(cart.total)}</div>
          </div>
        </button>
      </>
    );
  }
};

export default CartAction;
