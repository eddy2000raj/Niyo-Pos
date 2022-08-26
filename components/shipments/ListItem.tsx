import React from 'react';
import moment from 'moment';
import { formatCurrency } from '../../utils/Toolkit';
import { SHIPMENT_PURCHASE, SHIPMENT_RETURN } from '../../hooks/useShipments';
import styled from 'styled-components';

const ListItem = ({ item, select, isActive }) => {
  const type = item.id ? SHIPMENT_PURCHASE : SHIPMENT_RETURN;
  const id =
    type === SHIPMENT_PURCHASE ? item.id | item.document_number : item.ref_id;
  const date =
    type === SHIPMENT_PURCHASE
      ? moment.unix(item.created_at).format('Do MMM YYYY hh:mm A')
      : item.date;
  const total_amount =
    type === SHIPMENT_PURCHASE ? item.total : item.total_amount;
  const numberOfItems =
    type === SHIPMENT_PURCHASE
      ? Object.keys(item.items).length
      : item.total_items;

  return (
    <Root
      className={`${isActive ? 'active' : ''} card p-md xs mt-sm item`}
      onClick={() => select(item)}
    >
      <div className="grid gutter-between">
        <div className="xs">
          {type === SHIPMENT_RETURN && 'Reference Id:'} #{id}
        </div>
        <div>
          <i className="far fa-clock"></i> <span>{date}</span>
        </div>
      </div>
      <div className="grid gutter-between mt-xs">
        <div className="sm">
          {type === SHIPMENT_PURCHASE
            ? formatCurrency(total_amount)
            : `Total Return Amount: ${formatCurrency(total_amount)}`}
        </div>
        <div>
          {type === SHIPMENT_PURCHASE ? 'Items' : 'Quantity'}: {numberOfItems}
        </div>
      </div>
      <div className="sm mt-xs">
        {type !== SHIPMENT_PURCHASE &&
          `Updated in Ledger: ${formatCurrency(item.credit_amount)}`}
      </div>
      <div className="mt-xs">
        <span className={`tag-${item.status} tag`}>{item.status}</span>
      </div>
    </Root>
  );
};

const Root = styled.div`
  &:hover {
    cursor: pointer;
  }
`;

export default ListItem;
