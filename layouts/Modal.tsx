import { useDispatch } from 'react-redux';
import AppActions from '../redux/actions/AppAction';

interface Props {
  children: any;
  noExit?: boolean;
}

const Modal = ({ children, noExit }: Props) => {
  const dispatch = useDispatch();

  const close = () => {
    if (noExit) return;
    dispatch(AppActions.switchModal(null));
  };

  return (
    <>
      <div className="modal-backdrop" onClick={close}></div>
      <div className="modal p-lg">
        {!noExit && (
          <div className="close" onClick={close}>
            <i className="fas fa-times"></i>
          </div>
        )}
        <div className="body">{children}</div>
      </div>
    </>
  );
};

export default Modal;
