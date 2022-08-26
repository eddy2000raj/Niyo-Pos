import React from 'react';
import moment from 'moment';
import { formatCurrency } from '../../utils/Toolkit';
import { SHIPMENT_PURCHASE, SHIPMENT_RETURN } from '../../hooks/useShipments';
import ListItemDetailHeader from './ListItemDetailHeader';
import ListItemDetailBody from './ListItemDetailBody';

const ListItemDetail = ({ shipment }) => {
  const type = shipment.id ? SHIPMENT_PURCHASE : SHIPMENT_RETURN;
  const id = type === SHIPMENT_PURCHASE ? shipment.id : shipment.ref_id;
  const date =
    type === SHIPMENT_PURCHASE
      ? moment.unix(shipment.created_at).format('Do MMM YYYY hh:mm A')
      : shipment.date;
  const total =
    type === SHIPMENT_PURCHASE ? shipment.total : shipment.total_amount;

  return type === SHIPMENT_PURCHASE ? (
    <>
      <ListItemDetailHeader
        id={id}
        date={date}
        total={total}
        status={shipment.status}
        otp={shipment?.otp ?? 'XXXX'}
        documentNumber={shipment.document_number}
        formatCurrency={formatCurrency}
        type={type}
      />
      <div className="xs item-details col grow p-md card">
        {/* <hr className="hr light mt-md" /> */}
        <ListItemDetailBody type={type} items={shipment.items} total={total} />
      </div>
    </>
  ) : (
    <div className="xs col grow p-md item-details">
      {shipment.returns.map(order => (
        <div
          className="xs col grow p-md card"
          style={{ marginBottom: '10px' }}
          key={order.id}
        >
          <ListItemDetailHeader
            id={order.id}
            date={date}
            status={shipment.status}
            otp={shipment?.otp ?? 'XXXX'}
            documentNumber={order.document_number}
            formatCurrency={formatCurrency}
            item={order}
            total={order.total}
            type={type}
          />
          <hr className="hr light mt-md" />
          <ListItemDetailBody type={type} total={total} items={order} />
          {/* {index + 1 !== shipment.returns.length && <hr style={{ margin: "20px 0px" }} />} */}
        </div>
      ))}
    </div>
  );
};

export default ListItemDetail;
