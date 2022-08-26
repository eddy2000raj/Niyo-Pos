import { useDispatch } from 'react-redux';
import AppReducer from './reducers/AppReducer';
import thunkMiddleware, { ThunkDispatch, ThunkAction } from 'redux-thunk';
import {
  createStore,
  combineReducers,
  applyMiddleware,
  AnyAction,
  Action,
} from 'redux';
import { composeWithDevTools } from '@redux-devtools/extension';

const RootReducer = combineReducers({
  appState: AppReducer,
});

let enhancers: any;

if (process.env.NODE_ENV !== 'production') {
  enhancers = composeWithDevTools(applyMiddleware(thunkMiddleware));
} else {
  enhancers = applyMiddleware(thunkMiddleware);
}

export type RootState = ReturnType<typeof RootReducer>;
export type GetState = () => RootState;
export type ThunkyDispatch = ThunkDispatch<RootState, any, AnyAction>;
export type ThunkyAction<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
export const useThunkyDispatch = () => useDispatch<ThunkyDispatch>();

export default (initialState: RootState) => {
  if (typeof window === 'undefined') {
    return createStore(RootReducer, initialState, enhancers);
  }
  const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__';
  if (!window[__NEXT_REDUX_STORE__]) {
    window[__NEXT_REDUX_STORE__] = createStore(
      RootReducer,
      initialState,
      enhancers
    );
  }
  return window[__NEXT_REDUX_STORE__];
};
