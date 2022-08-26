import Cart from '../../../types/Cart';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);
import { ThunkyDispatch, GetState } from '../../store';
import AppAction from '../AppAction';
import {
  Mock_Card_Payment,
  Mock_Points_Payment,
} from '../../../stub/mock-data';
import PaymentAction from './PaymentAction';
import { PaymentMethod } from '../../../types/Payment';

//Mock uuidv4
jest.mock('uuid', () => ({ v4: () => 'test-111' }));
jest
  .spyOn(AppAction, 'replaceCart')
  .mockImplementation((cart: Cart, rebuild: boolean) => {
    return async (dispatch: ThunkyDispatch, getState: GetState) => {
      dispatch({
        type: 'app_cart_replace',
        payload: { cart: cart },
      });
    };
  });

describe('Payment Actions', function () {
  let store;
  beforeEach(() => {
    store = mockStore({
      appState: {
        cart: {
          balance: 999,
          payments: [],
        },
      },
    });
  });

  it('should add a payment method in cart when cart balance >0', () => {
    let payment_add_cart_response1 = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          balance: 999,
          payments: [Mock_Card_Payment],
        },
      },
    };

    store.dispatch(PaymentAction.add(PaymentMethod.CARD, 499)).then(res => {
      const actions = store.getActions();
      expect(actions[0]).toEqual(payment_add_cart_response1);
    });
  });

  it('should return undefined on add in cart when cart balance < 0', () => {
    store = mockStore({
      appState: {
        cart: {
          balance: -1,
          payments: [],
        },
      },
    });
    store.dispatch(PaymentAction.add(PaymentMethod.CARD, 499)).then(res => {
      expect(res).toBeUndefined();
    });
  });

  it('should return undefined on add in cart when item payment method is restricted', () => {
    store = mockStore({
      appState: {
        cart: {
          balance: -1,
          payments: [],
        },
      },
    });
    store.dispatch(PaymentAction.add(PaymentMethod.POINTS, 499)).then(res => {
      expect(res).toBeUndefined();
    });
  });

  xit('should collectRefundPayments from cart', () => {
    store = mockStore({
      appState: {
        cart: {
          newPayments: [Mock_Card_Payment],
        },
      },
    });

    let payment_add_cart_response3 = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          newPayments: [Mock_Card_Payment],
          payments: [Mock_Card_Payment],
        },
      },
    };

    store.dispatch(PaymentAction.collectRefundPayments()).then(res => {
      const actions = store.getActions();
      expect(actions[0]).toEqual(payment_add_cart_response3);
    });
  });

  xit('should addRefundPayment from cart', () => {
    store = mockStore({
      appState: {
        cart: {
          order: {
            payments: [Mock_Points_Payment],
            total: 1599,
          },
          balance: 699,
        },
      },
    });

    let payment_add_cart_response4 = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          order: {
            payments: [Mock_Points_Payment],
            total: 1599,
          },
          balance: 699,
          newPayments: [
            { method: PaymentMethod.POINTS, value: 436.71106941838644 },
          ],
        },
      },
    };

    store.dispatch(PaymentAction.addRefundPayment()).then(res => {
      const actions = store.getActions();
      expect(actions[0]).toEqual(payment_add_cart_response4);
    });
  });

  it('should remove payment from cart', () => {
    store = mockStore({
      appState: {
        cart: {
          payments: [Mock_Card_Payment, Mock_Points_Payment],
        },
      },
    });

    let payment_add_cart_response5 = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          payments: [Mock_Points_Payment],
        },
      },
    };

    store.dispatch(PaymentAction.remove(PaymentMethod.CARD, 499)).then(res => {
      const actions = store.getActions();
      expect(actions[0]).toEqual(payment_add_cart_response5);
    });
  });

  it('should reset cart for delivery', () => {
    store = mockStore({
      appState: {
        cart: {
          payments: [Mock_Card_Payment, Mock_Points_Payment],
          delivery_mode: 'delivery',
        },
      },
    });

    let payment_add_cart_response5 = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          payments: [Mock_Points_Payment],
          delivery_mode: 'delivery',
          display_status: 'Order Delivered',
        },
      },
    };

    store.dispatch(PaymentAction.reset()).then(res => {
      const actions = store.getActions();
      expect(actions[0]).toEqual(payment_add_cart_response5);
    });
  });

  it('should reset cart for picked', () => {
    store = mockStore({
      appState: {
        cart: {
          payments: [Mock_Card_Payment, Mock_Points_Payment],
          delivery_mode: '',
        },
      },
    });

    let payment_add_cart_response5 = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          payments: [Mock_Points_Payment],
          delivery_mode: '',
          display_status: 'Order Picked',
        },
      },
    };

    store.dispatch(PaymentAction.reset()).then(res => {
      const actions = store.getActions();
      expect(actions[0]).toEqual(payment_add_cart_response5);
    });
  });
});
