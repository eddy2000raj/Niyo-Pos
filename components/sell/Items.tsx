import React from 'react';
import Item from './Item';
import CartItem from '../../types/CartItem';
import { OrderItemSource, OrderItemStatus } from '../../types/OrderItem';

const ItemsHeader = ({ status, source }) => {
  if (status == OrderItemStatus.RETURNED) {
    return (
      <div className="xs p-sm red bold">
        <i className="fas fa-exchange-alt mr-xs"></i> Return Items
      </div>
    );
  } else if (status == OrderItemStatus.CANCELLED) {
    return (
      <div className="xs p-sm red bold">
        <i className="far fa-window-close mr-xs"></i> Cancelled Items
      </div>
    );
  } else if (
    [OrderItemSource.CUSTOMER, OrderItemSource.SYSTEM].includes(source)
  ) {
    return (
      <div className="xs p-sm green bold">
        <i className="fas fa-vote-yea mr-xs"></i> Order Items
      </div>
    );
  } else if (source == OrderItemSource.OFFER) {
    return (
      <div className="xs p-sm green bold">
        <i className="fas fa-percentage mr-xs"></i> Free Items
      </div>
    );
  }
  return null;
};

const Items = ({ items }: { items: CartItem[] }) => {
  if (items.length == 0) {
    return null;
  }
  return (
    <React.Fragment>
      <ItemsHeader status={items[0].status} source={items[0].source} />
      {items.map(item => (
        <Item key={item.product.id + item.status} item={item} />
      ))}
    </React.Fragment>
  );
};

export default Items;
