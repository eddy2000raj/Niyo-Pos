import useCustomers from '../../hooks/useCustomers';
import { useDispatch } from 'react-redux';
import AppActions from '../../redux/actions/AppAction';
import useCart from '../../hooks/useCart';
import { OrderSource } from '../../types/Order';
import useOutsideClick from '../../hooks/useOutsideClick';
import styled from 'styled-components';
import { useEffect } from 'react';
import { ModalName } from '../../types/Modal';

const Root = styled.div`
  border: 1px solid var(--color-grey-light);

  .suggestions {
    background-color: #fff;
    width: 100%;
    max-height: 60vh;
    border-radius: 5px;
    overflow-y: auto;
    box-shadow: 0 6px 10px var(--color-grey-dark);
    position: absolute;
  }

  .suggestions > div:first-child {
    margin-top: 10px;
  }

  .suggestions > div {
    padding: var(--dimen-sm) var(--dimen-md);
  }

  .suggestions > div:first-child {
    background-color: var(--color-grey-light);
  }

  .suggestions > div:hover {
    background-color: var(--color-grey-light);
  }

  .input-customer {
    border: 0;
  }
`;

const CustomerSearch = () => {
  const { cart, updateCustomer } = useCart();
  const dispatch = useDispatch();
  const [customers, keyword, setKeyword] = useCustomers();
  const trimmedKeyword = keyword.trim();
  const createCustomer = () =>
    dispatch(
      AppActions.switchModal(ModalName.CUSTOMER, { initialValue: keyword })
    );
  const [ref, active, setActive] = useOutsideClick();

  const removeCustomer = () => {
    updateCustomer(null);
    setKeyword('');
    // ref.current.focus();
  };

  useEffect(() => {
    setKeyword('');
  }, [cart.customer]);

  return (
    <Root className="">
      <form onSubmit={e => e.preventDefault()} autoComplete="off">
        <div
          className={`${cart.customer ? 'hidden' : ''} input-group rel`}
          ref={ref}
        >
          <div className="icon">
            <i className="fas fa-user"></i>
          </div>
          <input
            name="customer"
            type="text"
            className="input input-sm input-customer"
            placeholder="Add a customer"
            onFocus={() => setActive(true)}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />

          {/** Search Suggestions**/}
          {active && keyword.length > 0 && (
            <div className="mt-md suggestions">
              {customers.map(customer => (
                <div
                  key={customer.id}
                  className="pointer sm suggestion"
                  onClick={() => {
                    updateCustomer(customer);
                  }}
                >
                  {customer.first_name && (
                    <div className="initials mr-sm">
                      <span>{customer.first_name.charAt(0).toUpperCase()}</span>
                      <span>
                        {' '}
                        {customer.last_name
                          ? customer.last_name.charAt(0).toUpperCase()
                          : ''}
                      </span>
                    </div>
                  )}

                  <div>
                    <div>
                      {customer.first_name + ' ' + (customer.last_name || '')}
                    </div>
                    <div className="xs">{customer.mobile}</div>
                  </div>
                </div>
              ))}
              <div>
                <div className="sm pointer bold blue" onClick={createCustomer}>
                  <i className="fas fa-plus-circle"></i> Add &lsquo;
                  {trimmedKeyword}
                  &rsquo; as a new customer
                </div>
              </div>
            </div>
          )}
        </div>
      </form>

      {/** Selected Customer **/}
      {cart.customer && (
        <div className="grid gutter-sm sm c-center p-sm">
          <div>
            <div className="initials sm">
              <span>
                {cart.customer.first_name
                  ? cart.customer.first_name.charAt(0).toUpperCase()
                  : 'F'}
              </span>
              <span>
                {' '}
                {cart.customer.last_name
                  ? cart.customer.last_name.charAt(0).toUpperCase()
                  : ''}
              </span>
            </div>
          </div>
          <div className="col grow blue">
            <div>
              {cart.customer.first_name + ' ' + (cart.customer.last_name || '')}
            </div>
            <div className="xs">{cart.customer.mobile}</div>
          </div>
          {cart.source == OrderSource.POS && cart.balance > 0 && (
            <div className="right">
              <div className="center pointer" onClick={() => removeCustomer()}>
                <i className="far fa-trash-alt"></i>
              </div>
            </div>
          )}
        </div>
      )}
    </Root>
  );
};

export default CustomerSearch;
