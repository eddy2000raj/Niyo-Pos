import { useEffect } from 'react';
import usePayments from '../../hooks/usePayments';
import Empty from '../Empty';
import styled from 'styled-components';
import moment from 'moment';
import Storage, { StorageKey } from '../../utils/Storage';

const TransactionTable = () => {
  const { loadTransactionData, loadingTransaction, transactions } =
    usePayments();
  useEffect(() => {
    loadTransactionData();
  }, []);

  const lastUpdatedTime = Storage.get(StorageKey.LAST_UPDATED_TIME, null);
  let payTimestamp = null;
  if (lastUpdatedTime !== null && lastUpdatedTime['pay'] !== undefined) {
    payTimestamp = lastUpdatedTime['pay']['timestamp'][1];
  }

  return (
    <TableBody className="grow col bd items mr-sm">
      <div className="grid p-sm gutter-between heading">
        <h1 className="bold">Online Transactions</h1>
        <div className="flex">
          {payTimestamp !== null && (
            <h2 className="bold mr-md">
              Last Updated :{' '}
              {loadingTransaction ? (
                <i className="fas fa-sync fa-spin"></i>
              ) : (
                payTimestamp
              )}
            </h2>
          )}
          <i
            onClick={() => loadTransactionData()}
            className="fa fa-undo refresh-button"
            aria-hidden="true"
          ></i>
        </div>
      </div>
      {transactions.length === 0 && !loadingTransaction ? (
        <Empty />
      ) : (
        <div className="table-container">
          <div className="grid gutter-sm bold table-header ph-md">
            <div className="col-3">Date</div>
            <div className="col-5">Transaction ID</div>
            <div className="col-2">Amount</div>
            <div className="col-2 right">Status</div>
            <div className="hr dark col-12"></div>
          </div>
          {transactions.map((item, index) => (
            <ListItem item={item} key={index} />
          ))}
        </div>
      )}
    </TableBody>
  );
};

const ListItem = ({ item }) => {
  const { id, amount, created_at, status } = item;
  let color: string;
  switch (status) {
    case 'pending':
      color = 'yellow';
      break;
    case 'failed':
      color = 'red';
      break;
    case 'success':
      color = 'green';
      break;
  }
  return (
    <TableRow className="grid gutter-sm ph-md pv-sm sm">
      <div className="col-3">
        {moment.unix(created_at).format('Do MMM YY, h:mm a')}
      </div>
      <div className="col-5">
        <span className="mr-sm">{id}</span>
      </div>
      <div className="col-2 bold">{amount}</div>
      <div className={`col-2 bold right ${color}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    </TableRow>
  );
};

const TableRow = styled.div`
  cursor: default;

  :hover {
    background-color: #eee;
  }

  i {
    visibility: hidden;
    cursor: pointer;
  }

  :hover i {
    visibility: visible;
  }

  .copy-icon:hover {
    transform: scale(1.3);
  }

  .copy-icon:active {
    transform: scale(1.1);
  }
`;

const TableBody = styled.div`
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;

  .table-container {
    height: calc(38vh - var(--header-height));
    overflow-y: scroll;
    overflow-x: hidden;
  }

  .table-header {
    position: sticky;
    top: -1px;
    background: #f5f5f5;
    padding-top: 10px;
  }

  .heading {
    background-color: #eee;
  }

  .refresh-button {
    cursor: pointer;
  }

  .refresh-button:hover {
    transform: scale(1.1);
  }

  .refresh-button:active {
    transform: scale(1);
  }
`;

export default TransactionTable;
