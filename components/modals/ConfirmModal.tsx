import Modal from '../../layouts/Modal';
import { ModalProps } from '../ModalManager';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

interface Props extends ModalProps {
  action: any;
  message: string;
  type?: string;
}

const ConfirmModal = ({ complete, action, message, type }: Props) => {
  const loading = useSelector(
    (state: RootState) => state.appState.ui.logoutLoading
  );
  const discard = () => {
    complete();
  };

  const success = () => {
    action();
    if (type !== 'logout') complete();
  };

  return (
    <Modal noExit={loading}>
      <h1 className="title">Confirm Action</h1>
      <div className="mt-md sm">{message}</div>
      <div className="mt-lg grid gutter-between">
        <div className="col-4">
          <button
            disabled={loading}
            className="btn btn-red w-full"
            onClick={success}
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Yes'}
          </button>
        </div>
        <div className="col-4 right">
          <button
            disabled={loading}
            className="btn btn-green w-full"
            onClick={discard}
          >
            No
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
