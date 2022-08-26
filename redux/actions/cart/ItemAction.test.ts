import { PriceType } from '../../../types/Product';
import Cart from '../../../types/Cart';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);
import { ThunkyDispatch, GetState } from '../../store';
import AppAction from '../AppAction';
import { OrderItemSource, OrderItemStatus } from '../../../types/OrderItem';
import ItemAction from './ItemAction';
import {
  Mock_Discount,
  Mock_freshItem,
  Mock_freshItemWithDiscount,
  Mock_Product,
  Mock_Tax,
} from '../../../stub/mock-data';
import Order from '../../../types/Order';
import moment from 'moment';

const expected_return_date = moment()
  .endOf('day')
  .add(Mock_Product.return_window, 'days')
  .endOf('day')
  .unix();

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

//fresh item mock value
const freshItem: Cart = Mock_freshItem;

const freshItemWithDiscount: Cart = Mock_freshItemWithDiscount;

xdescribe('Item Actions', function () {
  let store;

  let item = {
    id: '111',
    product: Mock_Product,
    mrp: 100,
    price: 90,
    wanted: 88,
    quantity: 1,
    status: OrderItemStatus.PENDING,
    source: OrderItemSource.POS,
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

  beforeEach(() => {
    store = mockStore({
      appState: {
        cart: {
          items: [item],
          source: 'pos',
        },
      },
    });
  });

  it('should create a fresh Item', function () {
    expect(ItemAction.freshItem(Mock_Product, 10)).toEqual({
      id: 'test-111',
      product: Mock_Product,
      wanted: 10,
      quantity: 10,
      mrp: Mock_Product.mrp,
      price: Mock_Product.price,
      status: OrderItemStatus.CONFIRMED,
      tax: 0,
      total: 0,
      subtotal: 0,
      discount: 0,
      errors: null,
      taxes: [],
      dirty: false,
      parent_item: null,
      discounts: [],
      source: OrderItemSource.POS,
      type: PriceType.RETAIL,
      return_due_date: expected_return_date,
    });
  });

  it('should update Item quantity in a cart items list', () => {
    let newItem = {
      id: '111',
      product: Mock_Product,
      mrp: 100,
      price: 90,
      wanted: 88,
      quantity: 2,
      status: OrderItemStatus.CONFIRMED,
      source: OrderItemSource.POS,
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

    let note_action_response = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          items: [newItem],
          source: 'pos',
        },
      },
    };

    store.dispatch(ItemAction.add(Mock_Product)).then(res => {
      const actions = store.getActions();
      expect(actions[0]).toEqual(note_action_response);
    });
  });

  it('should add a fresh Item in a cart in offer', () => {
    let newItem = {
      id: 'test-111',
      product: Mock_Product,
      wanted: 1,
      quantity: 1,
      mrp: Mock_Product.mrp,
      price: Mock_Product.price,
      status: OrderItemStatus.CONFIRMED,
      tax: 0,
      total: 0,
      subtotal: 0,
      discount: 0,
      errors: null,
      taxes: [],
      dirty: false,
      parent_item: null,
      discounts: [],
      source: OrderItemSource.POS,
      type: PriceType.RETAIL,
      return_due_date: expected_return_date,
    };

    let note_action_response = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          items: [newItem],
          source: 'pos',
        },
      },
    };

    store = mockStore({
      appState: {
        cart: {
          items: [],
          source: 'pos',
        },
      },
    });

    store.dispatch(ItemAction.add(Mock_Product)).then(res => {
      const actions = store.getActions();
      expect(actions[0]).toEqual(note_action_response);
    });
  });

  it('should add a fresh Item in a cart in wholesale', () => {
    let newItem = {
      id: 'test-111',
      product: Mock_Product,
      wanted: 333,
      quantity: 333,
      mrp: Mock_Product.mrp,
      price: Mock_Product.price,
      status: OrderItemStatus.CONFIRMED,
      tax: 0,
      total: 0,
      subtotal: 0,
      discount: 0,
      errors: null,
      taxes: [],
      dirty: false,
      parent_item: null,
      discounts: [],
      source: OrderItemSource.POS,
      type: PriceType.RETAIL,
      return_due_date: expected_return_date,
    };

    let note_action_response = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          items: [newItem],
          source: 'pos',
          type: 'wholesale',
        },
      },
    };

    store = mockStore({
      appState: {
        cart: {
          items: [],
          source: 'pos',
          type: 'wholesale',
        },
      },
    });

    store.dispatch(ItemAction.add(Mock_Product)).then(res => {
      const actions = store.getActions();
      expect(actions[0]).toEqual(note_action_response);
    });
  });

  it('should update an Item in a cart for order source customer', () => {
    let existing_cart_Item = {
      id: 'test-111',
      product: Mock_Product,
      wanted: 10,
      quantity: 10,
      mrp: Mock_Product.mrp,
      price: 100,
      status: OrderItemStatus.CONFIRMED,
      tax: 0,
      total: 0,
      subtotal: 0,
      discount: 0,
      errors: null,
      taxes: [],
      dirty: false,
      parent_item: null,
      discounts: [],
      source: OrderItemSource.CUSTOMER,
      type: PriceType.RETAIL,
      return_due_date: expected_return_date,
    };

    let updatedItem = {
      id: 'test-111',
      product: Mock_Product,
      wanted: 10,
      quantity: 7,
      mrp: Mock_Product.mrp,
      price: 499,
      status: OrderItemStatus.PENDING,
      tax: 0,
      total: 0,
      subtotal: 0,
      discount: 0,
      errors: null,
      taxes: [],
      dirty: true,
      parent_item: null,
      discounts: [],
      source: OrderItemSource.CUSTOMER,
      type: PriceType.RETAIL,
      return_due_date: expected_return_date,
    };

    let note_action_response = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          items: [updatedItem],
          source: 'pos',
          type: 'wholesale',
        },
      },
    };

    store = mockStore({
      appState: {
        cart: {
          items: [existing_cart_Item],
          source: 'pos',
          type: 'wholesale',
        },
      },
    });

    store
      .dispatch(ItemAction.update(existing_cart_Item.id, 7, 499))
      .then(res => {
        const actions = store.getActions();
        expect(actions[0]).toEqual(note_action_response);
      });
  });

  it('should update return quantity in an Items list in a cart', () => {
    let existing_cart_Item = {
      id: 'test-111',
      product: Mock_Product,
      wanted: 10,
      quantity: 10,
      mrp: Mock_Product.mrp,
      price: 100,
      status: OrderItemStatus.PENDING,
      tax: 0,
      total: 0,
      subtotal: 0,
      discount: 0,
      errors: null,
      taxes: [],
      dirty: false,
      parent_item: null,
      discounts: [],
      source: OrderItemSource.CUSTOMER,
      type: PriceType.RETAIL,
      return_due_date: expected_return_date,
    };

    store = mockStore({
      appState: {
        cart: {
          items: [existing_cart_Item],
        },
      },
    });

    let order: Order;

    let updatedItem = {
      id: 'test-111',
      product: Mock_Product,
      wanted: -7,
      quantity: -7,
      mrp: Mock_Product.mrp,
      price: 499,
      status: OrderItemStatus.RETURNED,
      tax: 0,
      total: 0,
      subtotal: 0,
      discount: 0,
      errors: null,
      taxes: [],
      dirty: false,
      parent_item: existing_cart_Item,
      discounts: [],
      source: OrderItemSource.POS,
      type: PriceType.RETAIL,
      return_due_date: expected_return_date,
    };

    let note_action_response = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          items: [existing_cart_Item, updatedItem],
          mallOrder: true,
          order,
        },
      },
    };

    store
      .dispatch(ItemAction.addReturn(order, existing_cart_Item, 7, 499, true))
      .then(res => {
        const actions = store.getActions();
        expect(actions[0]).toEqual(note_action_response);
      });
  });

  it('should remove item from cart items list', () => {
    let existing_cart_Item = {
      id: 'test-111',
      product: Mock_Product,
      wanted: 10,
      quantity: 10,
      mrp: Mock_Product.mrp,
      price: 100,
      status: OrderItemStatus.PENDING,
      tax: 0,
      total: 0,
      subtotal: 0,
      discount: 0,
      errors: null,
      taxes: [],
      dirty: false,
      parent_item: null,
      discounts: [],
      source: OrderItemSource.CUSTOMER,
      type: PriceType.RETAIL,
      return_due_date: expected_return_date,
    };

    store = mockStore({
      appState: {
        cart: {
          items: [existing_cart_Item],
        },
      },
    });

    let updatedItem = {
      id: 'test-111',
      product: Mock_Product,
      wanted: 10,
      quantity: 10,
      mrp: Mock_Product.mrp,
      price: 100,
      status: OrderItemStatus.CANCELLED,
      tax: 0,
      total: 0,
      subtotal: 0,
      discount: 0,
      errors: null,
      taxes: [],
      dirty: false,
      parent_item: null,
      discounts: [],
      source: OrderItemSource.CUSTOMER,
      type: PriceType.RETAIL,
      return_due_date: expected_return_date,
    };

    let note_action_response = {
      type: 'app_cart_replace',
      payload: {
        cart: {
          items: [updatedItem],
          refundPayments: [],
        },
      },
    };

    store.dispatch(ItemAction.remove(existing_cart_Item.id)).then(res => {
      const actions = store.getActions();
      expect(actions[0]).toEqual(note_action_response);
    });
  });
});
