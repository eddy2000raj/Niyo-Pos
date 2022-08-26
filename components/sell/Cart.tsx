import Note from './Note';
import React, { useEffect, useState } from 'react';
import Items from './Items';
import Discount from './Discount';
import CartAction from './CartAction';
import styled from 'styled-components';
import Toolkit from '../../utils/Toolkit';
import useCart from '../../hooks/useCart';
import CustomerSearch from './CustomerSearch';
import { PriceType } from '../../types/Product';
import { OrderItemSource, OrderItemStatus } from '../../types/OrderItem';

const SaleBody = styled.div`
  overflow-y: auto;
  scroll-behavior: smooth;
  flex-grow: 1;
  flex-basis: 1px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-top: 2px solid var(--color-grey-light);

  .sale-items {
    flex-shrink: 0;
  }

  .sale-summary {
    padding: var(--dimen-xs) var(--dimen-sm);
    border-top: 2px solid var(--color-grey-light);
    flex-shrink: 0;
  }
`;

const SaleFooter = styled.div`
  padding: var(--dimen-xs);
  border-top: 2px solid var(--color-grey-light);
`;

const Cart = ({ moveToPayment }) => {
  const {
    cart,
    updateNote,
    updateDiscount,
    markConfirmed,
    canWholesale,
    setType,
  } = useCart();
  const [showNote, setShowNote] = useState(!!cart.note);
  const [showDiscount, setShowDiscount] = useState(!!cart.discount_value);

  useEffect(() => {
    setShowDiscount(!!cart.discount_value);
  }, [cart.discount_value]);

  const removeNote = () => {
    setShowNote(false);
    updateNote('');
  };

  const removeDiscount = () => {
    setShowDiscount(false);
    updateDiscount(0, 'value');
  };

  const handleShowDiscount = () => {
    if (cart.source === 'customer') return;
    if (cart.total > 0) setShowDiscount(true);
  };

  return (
    <>
      <div>
        <CustomerSearch />
      </div>
      {canWholesale() && (
        <div>
          <div className="bg-white-dark xs p-md pv-xs">
            <div className="grid c-center gutter-between">
              <div className="col">You are creating a {cart.type} order</div>
              <div className="col">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={cart.type == PriceType.WHOLESALE}
                    onChange={e => setType(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
      <SaleBody>
        <div className="sale-items">
          <Items
            items={cart.items.filter(
              item =>
                item.status == OrderItemStatus.CONFIRMED &&
                item.source == OrderItemSource.POS
            )}
          />
          <Items
            items={cart.items.filter(
              item =>
                [OrderItemStatus.CONFIRMED, OrderItemStatus.PENDING].includes(
                  item.status
                ) &&
                [OrderItemSource.CUSTOMER, OrderItemSource.SYSTEM].includes(
                  item.source
                )
            )}
          />
          <Items
            items={cart.items.filter(
              item => item.status == OrderItemStatus.RETURNED
            )}
          />
          <Items
            items={cart.items.filter(
              item => item.status == OrderItemStatus.CANCELLED
            )}
          />
          <Items
            items={cart.items.filter(
              item => item.source == OrderItemSource.OFFER
            )}
          />
        </div>
        <div className="semi-bold sale-summary xs">
          <div className="grid gutter-between">
            <div className="bold">ADD</div>
            <div>
              {!showDiscount && (
                <div
                  className={`inline-block mr-md pointer ${
                    cart.total <= 0 || cart.source === 'customer'
                      ? 'muted disabled'
                      : 'blue'
                  }`}
                  onClick={handleShowDiscount}
                >
                  DISCOUNT
                </div>
              )}
              <div className="inline-block pointer mr-md muted disabled">
                PROMO CODE
              </div>
              {!showNote && (
                <div
                  className="inline-block blue pointer"
                  onClick={() => setShowNote(true)}
                >
                  NOTE
                </div>
              )}
            </div>
          </div>
          {(showNote || cart.note) && <Note remove={removeNote} />}
          <hr className="hr light mt-xs" />
          <div className="grid gutter-xs mt-xs">
            <div className="col-6">Subtotal</div>
            <div className="col-5 right">
              {Toolkit.formatCurrency(cart.subtotal)}
            </div>
          </div>
          <hr className="hr light mt-xs" />
          <div className="grid gutter-xs mt-xs">
            <div className="col-6">Tax</div>
            <div className="col-5 right">
              {Toolkit.formatCurrency(cart.tax)}
            </div>
          </div>
          {(showDiscount || !!cart.discount_value) && (
            <Discount remove={removeDiscount} />
          )}
        </div>
      </SaleBody>

      <SaleFooter>
        <CartAction
          cart={cart}
          markConfirmed={markConfirmed}
          moveToPayment={moveToPayment}
        />
      </SaleFooter>
    </>
  );
};

export default Cart;
