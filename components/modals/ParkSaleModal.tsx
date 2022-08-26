import Modal from '../../layouts/Modal';
import { ModalProps } from '../ModalManager';
import useCart from '../../hooks/useCart';
import Analytics from '../../utils/Analytics';
import { Event } from '../../types/Event';

interface Props extends ModalProps {}

const ParkSaleModal = ({ complete }: Props) => {
  const { cart, updateNote, park } = useCart();

  const submit = async () => {
    Analytics.trackEvent(Event.PARKSALE);
    park();
    complete();
  };

  const updateParked = e => {
    updateNote(e);
  };

  return (
    <Modal>
      <h1 className="title">Add a note to the sale</h1>

      <div className="mt-lg sm">
        You are about to park this sale. Add a note so it can be identified by
        the next person who continues this sale.
      </div>
      <div className="mt-sm">
        <textarea
          className="input"
          name="park-sale-note"
          placeholder="Enter a note about this sale"
          rows={2}
          value={cart.note}
          onChange={e => updateParked(e.target.value)}
        ></textarea>
      </div>
      <div className="mt-lg right">
        <button className="btn btn-green btn-lg" onClick={submit}>
          Park Sale{' '}
        </button>
      </div>
    </Modal>
  );
};

export default ParkSaleModal;
