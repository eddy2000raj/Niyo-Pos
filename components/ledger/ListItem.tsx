import moment from 'moment';
import Toolkit from '../../utils/Toolkit';

const ListItem = ({ item, key }) => {
  return (
    <div className="grid gutter-xs mt-md xs" key={key}>
      <div className="col-3">
        {item.transaction_date &&
          moment.utc(item.transaction_date).local().format(`MMM Do YY, h:mm a`)}
      </div>
      <div className="col-3 bold">
        <p className="">{item.transaction_id ? item.transaction_id : '--'}</p>

        <div>
          {item.reference_type && item.reference_id && (
            <div>
              <span className="bold upper">
                {item.reference_type && item.reference_type + ': '}{' '}
              </span>
              <span>{item.reference_id && item.reference_id}</span>
            </div>
          )}
          {item.payment_method && (
            <div className="tag tag-generated mt-xs upper">
              {item.payment_method}
            </div>
          )}
          {item.reference_type === 'invoice' && (
            <div className="tag tag-generated mt-xs upper">purchase</div>
          )}
          {item.reference_type === 'credit_note' && (
            <div className="tag tag-generated mt-xs upper">return</div>
          )}
        </div>
      </div>

      <div className="col-2 center">
        {item.type === 'credit' ? Toolkit.formatCurrency(item.amount) : '-'}
      </div>

      <div className="col-2 center">
        {item.type === 'debit' ? Toolkit.formatCurrency(item.amount) : '-'}
      </div>

      <div className="col-2 center bold">
        {Toolkit.formatCurrency(item.balance, false)}
      </div>

      <div className="hr dark col-12 mt-sm"></div>
    </div>
  );
};

export default ListItem;
