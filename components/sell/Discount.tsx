import { useState } from 'react';
import useCart from '../../hooks/useCart';
import Toolkit, { formatCurrency } from '../../utils/Toolkit';
import styled from 'styled-components';

const TYPE_VALUE = 'value';
const TYPE_PERCENTAGE = 'percentage';

const Root = styled.div`
  .discount {
    display: flex;
  }

  .discount .btn {
    flex-basis: 40px;
    border-color: var(--color-grey);
    border-right: 0;
    flex-shrink: 0;
  }

  .discount .btn.active {
    font-weight: bold;
    background-color: var(--color-grey);
  }

  .discount .input {
    padding: var(--dimen-xs) var(--dimen-md);
    border-radius: 0;
    box-shadow: none;
  }
`;

const Discount = ({ remove }) => {
  const { cart, updateDiscount } = useCart();
  const [type, setType] = useState(cart.discount_format);
  const [enteredDiscount, setEnteredDiscount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const handleDiscount = e => {
    let discount = e.target.value;
    if (discount === '') {
      discount = 0;
      return setEnteredDiscount(0);
    }
    if (discount.charAt(0) == 0) {
      setEnteredDiscount(discount.substring(1));
    } else {
      setEnteredDiscount(discount);
    }
  };
  const applyDiscount = () => {
    if (enteredDiscount == 0) {
      return;
    }
    updateDiscount(enteredDiscount, type);
    setEnteredDiscount(0);
    setDiscountApplied(true);
  };

  const removeDiscount = () => {
    updateDiscount(0, type);
    setDiscountApplied(false);
  };
  return (
    <Root>
      <hr className="hr light mt-xs" />
      <div className="grid gutter-sm mt-sm c-center">
        <div className="col-2">Discount</div>
        {!discountApplied && (
          <div className="col-5 discount">
            <button
              className={`${
                type == TYPE_PERCENTAGE ? 'active' : ''
              } btn btn-xs`}
              onClick={() => setType(TYPE_PERCENTAGE)}
            >
              %
            </button>
            <button
              className={`${type == TYPE_VALUE ? 'active' : ''} btn btn-xs`}
              onClick={() => setType(TYPE_VALUE)}
            >
              &#8377;
            </button>
            <input
              className={`input input-xs ${discountApplied ? 'disabled' : ''}`}
              type="number"
              min="0"
              onFocus={e => e.target.select()}
              value={enteredDiscount}
              onChange={handleDiscount}
              disabled={discountApplied}
            />
          </div>
        )}
        {discountApplied ? (
          <div className="col-7 orange center">Applied!</div>
        ) : (
          <div>
            <button
              onClick={applyDiscount}
              type="button"
              className="col-2 pointer btn"
            >
              Apply
            </button>
          </div>
        )}

        <div className="col-2 right">
          {Toolkit.formatCurrency(cart.discount_value)}
        </div>
        <div className="col-1 center pointer" onClick={() => remove()}>
          <i className="far fa-trash-alt"></i>
        </div>
      </div>

      {cart.discount_value >= cart.maxDiscountValue && (
        <div className="bg-yellow white p-md pv-xs sm mt-sm">{`Max discount applicable on this order is ${formatCurrency(
          cart.maxDiscountValue
        )} (${Toolkit.round(cart.maxDiscountPercentage, 2)}%)`}</div>
      )}
    </Root>
  );
};

export default Discount;
