import React from 'react';
import styled from 'styled-components';

function ListItemDetailHeader({
  id,
  date,
  total = '',
  status,
  otp,
  type,
  documentNumber,
  item = null,
  formatCurrency,
}) {
  return (
    <Root className="grid gutter-between p-md">
      <div>
        <div># {id}</div>
        <div className="mt-xs">
          <i className="far fa-clock"></i> {date}
        </div>
        {status == 'dispatched' && (
          <div className="mt-xs tag tag-dispatched">
            <div className="md">
              OTP: <span className="ls-sm bold">{otp}</span>
            </div>
          </div>
        )}
      </div>
      <div className="right">
        {!((item ? item.status : status) === 'cancelled') && (
          <div className="semi-bold">
            {type === 'return' ? 'Credit Note Number' : 'Invoice Number'}:{' '}
            {documentNumber}
          </div>
        )}
        {total && <div className="md bold mt-xs">{formatCurrency(total)}</div>}
        <div className="mt-xs">
          <span className={`tag-${item ? item.status : status} tag`}>
            {item ? item.status : status}
          </span>
        </div>
      </div>
    </Root>
  );
}

const Root = styled.div`
  .tag-initiated {
    background: var(--color-yellow);
  }
  background: var(--color-white);
`;

export default ListItemDetailHeader;
