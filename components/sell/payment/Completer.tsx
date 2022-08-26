import { useState } from 'react';
import { useDispatch } from 'react-redux';
import Cart from '../../../types/Cart';
import AppAction from '.././../../redux/actions/AppAction';

interface Props {
  cart: Cart;
  complete: () => void;
}

const Completer = ({ cart, complete }: Props) => {
  const EXCLUDED_ORDER_STATUS = ['cancelled', 'fulfilled'];
  const [isOTPValid, setIsOTPValid] = useState(false);
  const dispatch = useDispatch();
  const checkIfOTPIsValid = value => {
    if (value.length === 6) {
      if (value === cart.verification_code) {
        setIsOTPValid(true);
      } else {
        setIsOTPValid(false);
        dispatch(
          AppAction.pushToast({
            title: 'Error',
            description: 'OTP is invalid',
          })
        );
      }
    } else setIsOTPValid(false);
  };

  return (
    <div>
      {cart.verification_code &&
        cart.source === 'customer' &&
        !EXCLUDED_ORDER_STATUS[cart.status] && (
          <div className="grid gutter-md c-center mt-md">
            <div className="col-6 lg semi-bold">Verification OTP </div>
            <div className="col-6">
              <input
                placeholder="Enter OTP"
                className="input amount"
                type="text"
                maxLength={6}
                onChange={e => checkIfOTPIsValid(e.target.value.trim())}
              />
            </div>
          </div>
        )}
      <div className="xl center semi-bold mt-xl">
        {cart.total < 0 ? 'Refund Paid' : 'Payment Received'}
      </div>
      <div className="p-xl">
        {cart.verification_code &&
        cart.source === 'customer' &&
        !EXCLUDED_ORDER_STATUS[cart.status] ? (
          <button
            disabled={!isOTPValid}
            className="btn btn-green btn-lg w-full mt-lg"
            onClick={() => complete()}
          >
            Complete Sale
          </button>
        ) : (
          <button
            className="btn btn-green btn-lg w-full mt-lg"
            onClick={() => complete()}
          >
            Complete Sale
          </button>
        )}
      </div>
    </div>
  );
};

export default Completer;
