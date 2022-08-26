import { PriceType, Price } from '../../../types/Product';
import CartAction from './CartAction';
import { v4 as uuidv4 } from 'uuid';
import Cart from '../../../types/Cart';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);
import { ThunkyDispatch, GetState, ThunkyAction } from '../../store';
import AppAction from '../AppAction';
import Customer from '../../../types/Customer';
import CartItem, { CartItemExtras } from '../../../types/CartItem';
import { OrderItemSource, OrderItemStatus } from '../../../types/OrderItem';
import CartItemProcessor from '../../../utils/brainiac/processors/CartItemProcessor';
import CartProvider from '../../../utils/brainiac/providers/CartProvider';
import CartProcessor from '../../../utils/brainiac/processors/CartProcessor';
import {
  Mock_Product,
  Mock_Empty_Store,
  Mock_Customer,
  Mock_Action,
  Mock_Tax,
  Mock_Price,
  Mock_Tag,
  Mock_freshItem,
  Mock_freshItemWithDiscount,
  Mock_Discount,
  Mock_BlackListRule_WholeSaleDisabled_Store,
  Mock_BlackListRule_WholeSaleEnabled_Store,
} from '../../../stub/mock-data';
import moment from 'moment';

// Mocking functions
//Mock uuidv4
jest.mock('uuid', () => ({ v4: () => 'test-111' }));
//Mock AppAction.replaceCart function
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

jest
  .spyOn(CartItemProcessor, 'execute')
  .mockImplementation(async (cart: Cart): Promise<Cart> => {
    const provider = new CartProvider(cart);
    return provider.getCart();
  });

jest
  .spyOn(CartProcessor, 'execute')
  .mockImplementation(async (cart: Cart): Promise<Cart> => {
    const provider = new CartProvider(cart);
    return provider.getCart();
  });

//Mocking Data
let customer: Customer = Mock_Customer;

//fresh item mock value
const freshItem: Cart = Mock_freshItem;

const freshItemWithDiscount: Cart = Mock_freshItemWithDiscount;

const expected_return_date = moment()
  .endOf('day')
  .add(Mock_Product.return_window, 'days')
  .endOf('day')
  .unix();

//Writing test suit
xdescribe('Cart Actions', function () {
  let store;
  beforeEach(() => {
    store = mockStore(Mock_Empty_Store);
  });

  it('should return testid as test-111', () => {
    expect(uuidv4()).toEqual('test-111');
  });

  it('should create a fresh Cart', function () {
    expect(CartAction.fresh()).toEqual(Mock_freshItem);
  });

  it('should add a custom note in cart', () => {
    //response action
    let note_action_response = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          note: 'test note',
        },
      },
    };

    store.dispatch(CartAction.updateNote('test note')).then(res => {
      const actions = store.getActions();
      expect(actions[0]).toEqual(note_action_response);
    });
  });

  it('should update discount in a cart', () => {
    let update_discount_response = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          discount_format: 'percentage',
          discount_value: 10,
          discount_percentage: 10,
        },
      },
    };

    store.dispatch(CartAction.updateDiscount(10, 'percentage')).then(res => {
      const actions = store.getActions();
      expect(actions[0]).toEqual(update_discount_response);
    });
  });

  it('should update customer details in a cart', () => {
    let update_customer_response = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          customer: Mock_Customer,
        },
      },
    };

    store.dispatch(CartAction.updateCustomer(Mock_Customer)).then(res => {
      const actions = store.getActions();
      expect(actions[0]).toEqual(update_customer_response);
    });
  });

  it('should set type  WholeSale in a cart when parameter passed as true with customer and store wholesaling was true', () => {
    customer['settings'] = {
      wholesaling: true,
    };

    store = mockStore({
      appState: {
        cart: {
          customer: customer,
        },
        store: {
          settings: {
            wholesaling: true,
          },
        },
      },
    });

    let setType_response = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          customer: customer,
          type: 'wholesale',
        },
      },
    };

    store.dispatch(CartAction.setType(true)).then(res => {
      const actions = store.getActions();
      expect(actions[0]).toEqual(setType_response);
    });
  });

  it('should set type  Retail in a cart when parameter passed as false with customer and store wholesaling was true', () => {
    customer['settings'] = {
      wholesaling: true,
    };

    store = mockStore({
      appState: {
        cart: {
          customer: customer,
        },
        store: {
          settings: {
            wholesaling: true,
          },
        },
      },
    });

    let setType_response = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          customer: customer,
          type: 'retail',
        },
      },
    };

    store.dispatch(CartAction.setType(false)).then(res => {
      const actions = store.getActions();
      expect(actions[0]).toEqual(setType_response);
    });
  });

  it('should set type  Retail in a cart when customer wholesaling is false', () => {
    customer['settings'] = {
      wholesaling: false,
    };

    store = mockStore({
      appState: {
        cart: {
          customer: customer,
        },
        store: {
          settings: {
            wholesaling: true,
          },
        },
      },
    });

    let setType_response = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          customer: customer,
          type: 'retail',
        },
      },
    };

    store.dispatch(CartAction.setType(true)).then(res => {
      const actions = store.getActions();
      expect(actions[0]).toEqual(setType_response);
    });
  });

  it('should set type  Retail in a cart when store wholesaling is false', () => {
    customer['settings'] = {
      wholesaling: true,
    };

    store = mockStore({
      appState: {
        cart: {
          customer: customer,
        },
        store: {
          settings: {
            wholesaling: false,
          },
        },
      },
    });

    let setType_response = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          customer: customer,
          type: 'retail',
        },
      },
    };

    store.dispatch(CartAction.setType(true)).then(res => {
      const actions = store.getActions();
      expect(actions[0]).toEqual(setType_response);
    });
  });

  it('should apply blackList rule in cart for source=offer,status=pending,type=retail', () => {
    let cartItem: CartItem = {
      id: '111',
      product: Mock_Product,
      mrp: 100,
      price: 90,
      wanted: 88,
      quantity: 1,
      status: OrderItemStatus.PENDING,
      source: OrderItemSource.OFFER,
      discounts: [Mock_Discount],
      type: PriceType.RETAIL,
      dirty: true,
      tax: 6666,
      total: 1000,
      subtotal: 2000,
      discount: 200,
      errors: {},
      taxes: [Mock_Tax],
      return_due_date: expected_return_date,
    };

    store = mockStore(Mock_BlackListRule_WholeSaleDisabled_Store);

    // blacklist-rule-1,blacklist-rule-2 is store cart blaclist rule and discount-rule-id-111 is
    let applyBlackList_response = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          blacklist_rules: [
            'blacklist-rule-1',
            'blacklist-rule-2',
            'discount-rule-id-111',
          ],
        },
      },
    };

    store.dispatch(CartAction.blacklistRule(cartItem)).then(res => {
      const actions = store.getActions();
      expect(actions[0]).toEqual(applyBlackList_response);
    });
  });

  it('should build cart for orderstatus=POS', () => {
    let cartItem1: CartItem = {
      id: '111',
      product: Mock_Product,
      mrp: 100,
      price: 100,
      wanted: 99,
      quantity: 1,
      status: OrderItemStatus.PENDING,
      source: OrderItemSource.POS,
      discounts: [Mock_Discount],
      type: PriceType.RETAIL,
      dirty: true,
      tax: 5,
      total: 100,
      subtotal: 99,
      discount: 2,
      errors: {},
      taxes: [Mock_Tax],
      return_due_date: expected_return_date,
    };

    let cartItem2: CartItem = {
      id: '111',
      product: Mock_Product,
      mrp: 100,
      price: 100,
      wanted: 90,
      quantity: 1,
      status: OrderItemStatus.PENDING,
      source: OrderItemSource.POS,
      discounts: [Mock_Discount],
      type: PriceType.RETAIL,
      dirty: true,
      tax: 5,
      total: 100,
      subtotal: 99,
      discount: 2,
      errors: {},
      taxes: [Mock_Tax],
      return_due_date: expected_return_date,
    };

    store = mockStore(Mock_BlackListRule_WholeSaleEnabled_Store);

    // blacklist-rule-1,blacklist-rule-2 is store cart blaclist rule and discount-rule-id-111 is
    let applyBlackList_response = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          blacklist_rules: [
            'blacklist-rule-1',
            'blacklist-rule-2',
            'discount-rule-id-111',
          ],
        },
      },
    };

    customer['settings'] = {
      wholesaling: false,
    };

    Mock_freshItemWithDiscount['customer'] = customer;
    Mock_freshItemWithDiscount['items'] = [cartItem1, cartItem2];

    store.dispatch(CartAction.build(Mock_freshItemWithDiscount)).then(res => {
      expect(res['tax']).toBe(54.181818);
      expect(res['subtotal']).toBe(145.818182);
      expect(res['total']).toBe(196);
    });
  });

  it('should add return reason id when we return items', () => {
    let cart_response_with_return_reason_id = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          order_return_reason_id: 1,
        },
      },
    };

    store.dispatch(CartAction.addReturnReason(1)).then(res => {
      const actions = store.getActions();
      expect(actions[0]).toEqual(cart_response_with_return_reason_id);
    });
  });

  it('should add parent ref id when we return items i.e cart.total < 0', () => {
    let cart_response_parent_ref_id = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          parent_ref_id: 'abcd',
        },
      },
    };

    store.dispatch(CartAction.addPrentRefId('abcd')).then(res => {
      const actions = store.getActions();
      expect(actions[0]).toEqual(cart_response_parent_ref_id);
    });
  });
});
