import React from 'react';
import Cart from '../../../types/Cart';
import { PaymentMethod, RestrictedMethods } from '../../../types/Payment';
import Toolkit from '../../../utils/Toolkit';
import { OrderItemStatus } from '../../../types/OrderItem';

interface Props {
  cart: Cart;
  removePayment: (method: PaymentMethod, value: number) => any;
}

const Summary = ({ cart, removePayment }: Props) => {
  const PaymentRow = payment => {
    return (
      <div
        className="grid gutter-between mt-md"
        key={payment.method + payment.value}
      >
        <div className="upper semi-bold">
          {payment.method} {payment.value < 0 ? '(Refund)' : ''}
        </div>
        <div>
          <span className="mr-sm">
            {Toolkit.formatCurrency(Toolkit.round(payment.value, 2))}
          </span>
          {!RestrictedMethods.includes(payment.method) && (
            <span
              className="pointer"
              onClick={() => removePayment(payment.method, payment.value)}
            >
              <i className="fas fa-trash-alt"></i>
            </span>
          )}
        </div>
      </div>
    );
  };
  let finalPayments = cart.payments;
  if (cart.refundPayments?.length) {
    finalPayments = Toolkit.mergePayments([
      ...cart?.payments,
      ...cart?.refundPayments,
    ]);
  }
  return (
    <div className="ph-lg sm cart-summary">
      <div className="grid gutter-lg mt-sm pv-md xs">
        {cart.items
          .filter(item => item.status != OrderItemStatus.CANCELLED)
          .map(item => {
            return (
              <React.Fragment key={item.product.id + item.status}>
                <div className="col-2">{item.quantity}</div>
                <div className="col-7">{item.product.name}</div>
                <div className="col-3 right">
                  {Toolkit.formatCurrency(item.total)}
                  {item.discount > 0 && (
                    <div className="strike xs normal">
                      {Toolkit.formatCurrency(
                        item.product.price * item.quantity
                      )}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
      </div>

      <hr className="hr dark mt-md" />

      <div className="grid gutter-md pv-md semi-bold">
        <div className="col-6">Subtotal</div>
        <div className="col-6 right">
          {Toolkit.formatCurrency(cart.subtotal)}
        </div>
        <div className="col-6">Tax</div>
        <div className="col-6 right">{Toolkit.formatCurrency(cart.tax)}</div>
        {!!cart.discount_value && (
          <>
            <div className="col-6">Discount</div>
            <div className="col-6 right">
              {Toolkit.formatCurrency(cart.discount_value)}
            </div>
          </>
        )}
        {!!cart.rounded && (
          <>
            <div className="col-6 xs">Rounded (+/-)</div>
            <div className="col-6 right xs">
              {Toolkit.formatCurrency(cart.rounded)}
            </div>
          </>
        )}
      </div>

      <hr className="hr dark" />

      <div className="grid gutter-between gutter-md mt-md">
        <div>
          <span className="bold mr-sm md">GRAND TOTAL </span>
          <span className="xs">{cart.quantity} items</span>
        </div>
        <div className="bold md">{Toolkit.formatCurrency(cart.total)}</div>
      </div>

      {cart.note && cart.note.length > 0 && (
        <div className="grid gutter-between mt-sm xs">
          <span className="mr-sm">Note: </span>
          <div>{cart.note}</div>
        </div>
      )}

      <hr className="hr dark mt-md" />
      <div className="pv-md">
        {finalPayments.map(payment => PaymentRow(payment))}
      </div>
    </div>
  );
};

export default Summary;
