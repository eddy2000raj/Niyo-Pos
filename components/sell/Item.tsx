import { MouseEvent, useEffect, useRef, useState } from 'react';
import CartItem from '../../types/CartItem';
import { OrderItemSource, OrderItemStatus } from '../../types/OrderItem';
import useCart from '../../hooks/useCart';
import Toolkit from '../../utils/Toolkit';
import styled from 'styled-components';
import ItemDetails from './ItemDetails';
import { PriceType } from '../../types/Product';
import Storage, { StorageKey } from '../../utils/Storage';
import AppAction from '../../redux/actions/AppAction';
import { useDispatch } from 'react-redux';

const ItemDiv = styled.div`
  padding: var(--dimen-sm);
  border-bottom: 1px solid var(--color-grey-light);

  .trash-wrapper {
    width: 27px;
  }

  &.animate {
    animation: 2.5s color_change;
  }

  ${({ open }) => `
        border-left: ${open ? '4px solid var(--color-orange)' : 'none'};
    `}
`;

interface Props {
  item: CartItem;
}

const canModifyInventory = (item: CartItem): boolean => {
  return (
    [OrderItemStatus.PENDING, OrderItemStatus.CONFIRMED].includes(
      item.status
    ) &&
    item.source != OrderItemSource.OFFER &&
    item.source != OrderItemSource.CUSTOMER
  );
};

const Item = ({ item }: Props) => {
  const { removeItem, updateItem, updateItemQuantity, blacklistRule, cart } =
    useCart();
  let default_max_quantity_allowed = 10;
  const itemRef = useRef(null);
  const [active, setActive] = useState(false);
  const hasErrors = Object.entries(item.errors).length != 0;
  const [max_allowed_qty, set_max_allowed_qty] = useState(
    default_max_quantity_allowed
  );
  useEffect(() => {
    let max_quantity_allowed = default_max_quantity_allowed;
    if (Storage) {
      const store = Storage.get(StorageKey.STORE, null);
      max_quantity_allowed =
        store?.settings?.max_quantity_line_item || default_max_quantity_allowed;
    }
    set_max_allowed_qty(max_quantity_allowed);
  }, [Storage]);
  const animateItem = () => {
    const elem = itemRef.current;
    elem.classList.remove('animate');
    void elem.offsetWidth;
    elem.classList.add('animate');
  };

  useEffect(() => {
    animateItem();
  }, [item.quantity]);

  const totalDiscount = Toolkit.round(
    item.price * item.quantity - item.total,
    2
  );
  const dispatch = useDispatch();
  const quantityCounter = (e: MouseEvent, item: CartItem, qty: number) => {
    e.stopPropagation();
    if (!canModifyInventory(item)) return false;
    if (qty > max_allowed_qty) {
      dispatch(
        AppAction.pushToast({
          title: 'Error',
          description: `Can not add more than ${max_allowed_qty} units`,
        })
      );
      return;
    }
    qty = qty <= 0 ? item.quantity : qty;
    qty != item.quantity ? updateItemQuantity(item.id, qty) : animateItem();
  };

  const onTapped = () => {
    if (
      item.source == OrderItemSource.POS &&
      item.status == OrderItemStatus.CONFIRMED
    ) {
      setActive(!active);
    }
  };

  const update = async (item: CartItem, price: number, quantity: number) => {
    await updateItem(item.id, quantity, price);
    setActive(false);
  };

  return (
    <ItemDiv className={`${item.status} xs`} ref={itemRef} open={active}>
      <div className="grid gutter-md pointer" onClick={() => onTapped()}>
        <div className="col">
          {hasErrors && (
            <i
              className="fa fa-exclamation-triangle red"
              aria-hidden="true"
            ></i>
          )}
          {!hasErrors && <i className="fa-angle-right fas"></i>}
        </div>
        <div className="col grow">
          <h3 className="semi-bold">
            <div>{item.product.name}</div>
            <div
              className={`${
                canModifyInventory(item) ? '' : 'muted'
              } grid gutter-sm mt-xs`}
            >
              <div>
                <i
                  className="far fa-minus-square md"
                  onClick={e => quantityCounter(e, item, item.quantity - 1)}
                ></i>
              </div>
              <div>{item.quantity.toString()}</div>
              <div>
                <i
                  className="far fa-plus-square md"
                  onClick={e => quantityCounter(e, item, item.quantity + 1)}
                ></i>
              </div>
              {![OrderItemSource.CUSTOMER, OrderItemSource.SYSTEM].includes(
                item.source
              ) &&
                item.quantity < item.wanted && (
                  <div>
                    Wanted: <span className="red">{item.wanted}</span>
                  </div>
                )}
            </div>
          </h3>
        </div>
        <div className="col semi-bold right">
          <div>{Toolkit.formatCurrency(item.total)}</div>
          {totalDiscount > 0 && (
            <div className="strike xs normal">
              {Toolkit.formatCurrency(item.price * item.quantity)}
            </div>
          )}
          {item.type == PriceType.WHOLESALE && (
            <div className="mt-xs">
              <span className="tag bg-grey-light blue">{item.type}</span>
            </div>
          )}
        </div>
        <div className="col trash-wrapper">
          {item.status != OrderItemStatus.CANCELLED &&
            item.source != OrderItemSource.OFFER && (
              <div className="center" onClick={() => removeItem(item.id)}>
                <i
                  className={`far fa-trash-alt ${
                    (cart.mallOrder ||
                      item.status === OrderItemStatus.RETURNED) &&
                    'disabled muted'
                  }`}
                ></i>
              </div>
            )}
          {item.source == OrderItemSource.OFFER && (
            <div className="center" onClick={() => blacklistRule(item)}>
              <i className="fas fa-ban"></i>
            </div>
          )}
        </div>
      </div>
      {active && (
        <ItemDetails
          item={item}
          update={update}
          max_allowed_qty={max_allowed_qty}
        />
      )}
    </ItemDiv>
  );
};

export default Item;
