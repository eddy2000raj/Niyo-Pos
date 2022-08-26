import React from 'react';
import { SHIPMENT_PURCHASE } from '../../hooks/useShipments';
import { formatCurrency } from '../../utils/Toolkit';

const Item = ({ item, index }) => {
  return (
    <div className="mt-sm">
      <div className="grid gutter-sm">
        <div>#{++index}</div>
        <div className="col grow">
          <div>{item.product}</div>
          <div className="mt-xs">
            Quantity: {item.quantity} | Price: {formatCurrency(item.price)}
          </div>
          <div className="mt-xs">
            Type: <span className="upper">{item.variant}</span>
          </div>
        </div>
        <div className="right semi-bold">
          <div>₹{item.total}</div>
        </div>
      </div>
      <hr className="hr light mt-sm" />
    </div>
  );
};

function ListItemDetailBody({ type, items, total }) {
  return (
    <div className="mt-md">
      <div className="semi-bold">
        <i className="fas fa-stream"></i> ITEMS
      </div>
      {type === SHIPMENT_PURCHASE ? (
        <React.Fragment>
          <div className="mt-sm">
            {items.map((item, index) => (
              <Item key={item.product} item={item} index={index} />
            ))}
          </div>
          <div className="right mt-sm bold">Total: {formatCurrency(total)}</div>
        </React.Fragment>
      ) : (
        <React.Fragment key={items.id}>
          <div className="mt-sm">
            {items.items.map((item, index) => (
              <Item key={item.product} item={item} index={index} />
            ))}
          </div>
          <div className="right mt-sm bold">
            Total: {formatCurrency(items.total)}
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

export default ListItemDetailBody;
