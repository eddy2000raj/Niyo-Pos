import { useEffect } from 'react';
import Order from '../../types/Order';
import ReceiptFormat from '../ReceiptFormat';
import Analytics from '../../utils/Analytics';
import { Event } from '../../types/Event';

interface Props {
  order: Order;
  moveToCart: () => any;
}

const ReceiptPage = ({ order, moveToCart }: Props) => {
  useEffect(() => {
    if (!navigator.userAgent.match(/Android/i)) {
      window.onafterprint = () => {
        moveToCart();
      };
    }
  }, []);
  const handlePrint = () => {
    Analytics.trackEvent(Event.PRINT_RECEIPT, { order_id: order.id });
    window.print();
  };

  return (
    <>
      <div className="grid m-center bg-white p-lg vertical h-full">
        <div style={{ overflow: 'hidden auto', flexGrow: 1 }}>
          <div className="center lg">Sale Created!</div>
          <div className="center mt-lg">
            <button className="btn btn-green mr-sm" onClick={handlePrint}>
              PRINT RECEIPT
            </button>
            <button className="btn" onClick={() => moveToCart()}>
              SKIP PRINT
            </button>
          </div>
          <div className="mt-lg xs">
            <ReceiptFormat order={order} hidden={false} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ReceiptPage;
