import { useState } from 'react';
import useCart from '../../hooks/useCart';
import { useDispatch } from 'react-redux';
import AppActions from '../../redux/actions/AppAction';
import DB from '../../utils/database/DB';
import Dropdown from '../Dropdown';
import styled from 'styled-components';
import AppAction from '../../redux/actions/AppAction';
import { ModalName } from '../../types/Modal';
import moment from 'moment';

const Root = styled.div`
  .dd::before {
    left: 50%;
    transform: translateX(-50%);
  }
`;

const ParkedItem = ({ item, switchCart }) => {
  return (
    <div>
      <hr className="hr light mt-sm" />
      <div className="grid gutter-md mt-md">
        <div className="col-7">
          <div>{item.items.length} Items</div>
          <div className="xs">
            Parked at:{' '}
            <span className="semi-bold">
              {moment.unix(item.parked_at).format('Do MMM YY, h:mm a')}
            </span>{' '}
          </div>
          {item.note.length > 0 && (
            <div className="xs">
              Note: <span className="semi-bold">{item.note}</span>
            </div>
          )}
        </div>
        <div className="col-4">
          {item.customer ? (
            <>
              <div>
                {(item.customer.first_name || '') +
                  ' ' +
                  (item.customer.last_name || '')}
              </div>
              <div className="xs">{item.customer.mobile}</div>
            </>
          ) : (
            '-'
          )}
        </div>
        <div
          className="col-1"
          onClick={() => {
            switchCart(item);
          }}
        >
          <i className="fas fa-redo"></i>
        </div>
      </div>
      <div>
        Expiring in{' '}
        <span className="semi-bold">
          {moment.unix(item.parked_at).add(2, 'days').diff(moment(), 'hours')}{' '}
          Hours
        </span>
      </div>
    </div>
  );
};

const SaleActions = () => {
  const { cart, discard, updateDiscount, deleteExpiredParkedSales } = useCart();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [parkedSales, setParkedSales] = useState(null);
  const switchCart = cart => {
    setParkedSales(null);
    dispatch(AppAction.replaceCart(cart));
  };
  const getParkedSales = () => {
    if (!parkedSales) {
      return;
    }

    if (loading) {
      return (
        <div className="p-md default parked">
          <i className="fas fa-sync fa-spin"></i>
        </div>
      );
    }

    if (parkedSales.length == 0) {
      return (
        <div className="p-md default parked normal">
          <i className="far fa-pause-circle fa-5x"></i>
          <div className="semi-bold mt-md">
            You don&lsquo;t have any parked sales.
          </div>
          <div className="mt-sm xs">
            Parked sales can be used to put sale on hold, <br />
            while you serve other customers.
          </div>
        </div>
      );
    }

    return (
      <div className="p-md default parked left normal">
        <div className="grid gutter-md semi-bold">
          <div className="col-7">Parked Sale</div>
          <div className="col-4">Customer</div>
          <div className="col-1"></div>
        </div>
        {parkedSales.map(item => (
          <ParkedItem item={item} key={item.id} switchCart={switchCart} />
        ))}
      </div>
    );
  };

  const fetchParkedSale = async () => {
    await deleteExpiredParkedSales();
    setLoading(true);
    const results = await DB.carts.toArray();
    setParkedSales(results);
    setLoading(false);
  };

  return (
    <Root className="grid gutter-around xs">
      <div className="col blue">
        <Dropdown
          body={getParkedSales()}
          onClick={fetchParkedSale}
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        >
          <i className="fas fa-redo"></i> Retrieve Sale
        </Dropdown>
      </div>
      <div
        className={`${
          cart.items.length ? 'blue pointer' : 'muted disabled'
        } col`}
        onClick={() =>
          cart.items.length
            ? dispatch(AppActions.switchModal(ModalName.PARK_SALE))
            : ''
        }
      >
        <i className="fas fa-undo"></i> Park Sale
      </div>
      <div
        className={`${
          cart.items.length || cart.customer !== undefined
            ? 'blue pointer'
            : 'muted disabled'
        } col`}
        onClick={async () => {
          await updateDiscount(0, 'value');
          discard();
        }}
      >
        <i className="fas fa-trash-alt"></i> Discard Sale
      </div>
    </Root>
  );
};

export default SaleActions;
