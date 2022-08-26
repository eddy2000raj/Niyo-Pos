import Payment, {
  PaymentMethod,
  RestrictedMethods,
} from '../../../types/Payment';
import { GetState, ThunkyDispatch } from '../../store';
import AppAction from '../AppAction';
import Cart from '../../../types/Cart';
import CartItem from '../../../types/CartItem';
import { OrderItemStatus } from '../../../types/OrderItem';
import Toolkit from '../../../utils/Toolkit';

const add = (method: PaymentMethod, value: number) => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    if (RestrictedMethods.includes(method)) {
      return;
    }
    const cart = getState().appState.cart;
    let amount = value;
    if (cart.balance < 0) {
      amount = Math.min(Math.max(value, cart.balance), 0);
    } else if (cart.balance > 0) {
      amount = Math.max(Math.min(value, cart.balance), 0);
    }
    if (amount != 0) {
      const payment = cart.payments.find(
        payment => payment.method == method
      ) ?? { method, value: 0 };
      payment.value = payment.value + value;
      const payments = cart.payments.filter(
        payment => payment.method != method
      );
      const updatedCart: Cart = { ...cart, payments: [...payments, payment] };
      await dispatch(AppAction.replaceCart(updatedCart));
    }
  };
};

const collectRefundPayments = () => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    const cart = getState().appState.cart;
    const isCashAndPoints =
      cart.payments.length === 1 &&
      cart.payments[0].method === PaymentMethod.POINTS;
    const payments = cart.payments;
    if (isCashAndPoints) {
      const initialTotal = cart.items.reduce(
        (sum, item) => sum + item.total,
        0
      );
      payments.push({
        method: PaymentMethod.CASH,
        value:
          cart.total - cart.total * (cart.payments[0].value / initialTotal),
      });
    }
    cart.refundPayments.forEach(refundPayment => payments.push(refundPayment));
    const updatedCart: Cart = { ...cart, payments, refundPayments: [] };
    await dispatch(AppAction.replaceCart(updatedCart));
  };
};

const addRefundPayment = () => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    let refundPayments = [];
    const cart = getState().appState.cart;
    const paymentMethods = cart.order.payments.map(payment => payment.method);
    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }
    const unique = paymentMethods.filter(onlyUnique);
    const initialTotal = cart.order.items.reduce(
      (sum, item) => sum + item.total,
      0
    );
    const pointsPercentage =
      (cart.order?.payments.filter(pymnt => pymnt.method === 'points')[0]
        ?.value *
        100) /
      initialTotal;

    const refundPoints = (cart.balance * pointsPercentage) / 100;

    const otherRefund = refundPoints
      ? cart.balance - refundPoints
      : cart.balance;
    unique.map(method => {
      return refundPayments.push({
        method,
        value:
          method === PaymentMethod.POINTS
            ? refundPoints
            : otherRefund / (unique.length > 1 ? unique.length - 1 : 1),
      });
    });
    const updatedCart: Cart = { ...cart, refundPayments };
    await dispatch(AppAction.replaceCart(updatedCart));
  };
};

const adjustRefundRoundOffValue = (
  refundPayments: Payment[],
  totalRefundValue: number,
  points: Payment
) => {
  const refundAmountRoundOff = refundPayments.reduce(
    (sum, payment) => sum + payment.value,
    0
  );
  const difference = totalRefundValue - refundAmountRoundOff;
  if (difference) {
    refundPayments.forEach(({ method, value }) => {
      if (points) {
        if (method === PaymentMethod.POINTS) {
          return {
            method,
            value: value + difference,
          };
        }
      }
    });
  }
  return refundPayments;
};

const computePayments = (items: CartItem[], initialPayments: Payment[]) => {
  if (initialPayments?.length === 0) return initialPayments;
  let refundPayments: Payment[] = [];
  let total = 0;
  let initialTotal = 0;
  items.forEach(item => {
    initialTotal += item.total;
    if (item.status !== OrderItemStatus.CANCELLED) {
      total += item.total;
    }
  });
  const cancelled_total = initialTotal - total;
  const points = initialPayments?.find(
    (payment: Payment) => payment.method === PaymentMethod.POINTS
  );
  let refundPoints = 0;
  let flag = 0;
  let totalRefundValue = 0;
  if (points) {
    flag = 1;
    refundPoints = (points.value / initialTotal) * cancelled_total;
  }
  initialPayments?.forEach(({ method }) => {
    if (method === PaymentMethod.POINTS) {
      totalRefundValue += refundPoints;
      const refund_points = Toolkit.round(refundPoints, 0);
      refund_points &&
        refundPayments.push({
          method,
          value: -1 * refund_points,
        });
    } else {
      let refundValue =
        (cancelled_total - refundPoints) / (initialPayments.length - flag);
      totalRefundValue += refundValue;
      refundValue = Toolkit.round(refundValue, 0);
      refundValue &&
        refundPayments.push({
          method,
          value: -1 * refundValue,
        });
    }
  });
  refundPayments = adjustRefundRoundOffValue(
    refundPayments,
    totalRefundValue,
    points
  );
  return refundPayments;
};

const remove = (method: PaymentMethod, value: number) => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    const cart = getState().appState.cart;
    const payments = cart.payments.filter(payment => {
      if (payment.method == method && payment.value == value) {
        return false;
      }
      return true;
    });
    const updatedCart: Cart = { ...cart, payments };
    await dispatch(AppAction.replaceCart(updatedCart));
  };
};

const reset = () => {
  return async (dispatch: ThunkyDispatch, getState: GetState) => {
    const cart = getState().appState.cart;
    if (cart.delivery_mode === 'delivery') {
      cart.display_status = 'Order Delivered';
    } else {
      cart.display_status = 'Order Picked';
    }
    const payments = cart.payments.filter(payment =>
      RestrictedMethods.includes(payment.method)
    );
    const updatedCart: Cart = { ...cart, payments };
    await dispatch(AppAction.replaceCart(updatedCart));
  };
};

export default {
  add,
  remove,
  reset,
  addRefundPayment,
  collectRefundPayments,
  computePayments,
};
