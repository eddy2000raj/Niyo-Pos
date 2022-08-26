import { RootState } from '../redux/store';
import { useSelector, useDispatch } from 'react-redux';
import CustomerModal from './modals/CustomerModal';
import AppActions from '../redux/actions/AppAction';
import ParkSaleModal from './modals/ParkSaleModal';
import ReturnItemsModal from './modals/ReturnItemsModal';
import ConfirmModal from './modals/ConfirmModal';
import ReloginModal from './modals/ReloginModal';
import VersionUpdateModal from './modals/VersionUpdateModal';
import { ModalName } from '../types/Modal';
import ChangeDateModal from './modals/ChangeDateModal';
import CommissionModal from './modals/CommissionModal';
import CollectionModal from './modals/CollectionModal';
import ReportsTnc from './modals/ReportsTnc';

export interface ModalProps {
  complete: () => any;
}

const mapRootState = (rootState: RootState) => {
  if (rootState.appState.modal) {
    return {
      name: rootState.appState.modal.name,
      data: rootState.appState.modal.data,
    };
  }
  return { name: null, data: null };
};

const ModalManager = () => {
  const dispatch = useDispatch();
  const { name, data } = useSelector(mapRootState);

  const complete = () => {
    dispatch(AppActions.switchModal(null));
  };

  let Modal = null;
  switch (name) {
    case ModalName.RETURN_ITEMS:
      Modal = ReturnItemsModal;
      break;

    case ModalName.CUSTOMER:
      Modal = CustomerModal;
      break;

    case ModalName.PARK_SALE:
      Modal = ParkSaleModal;
      break;

    case ModalName.CONFIRM:
      Modal = ConfirmModal;
      break;
    case ModalName.RELOGIN:
      Modal = ReloginModal;
      break;
    case ModalName.VERSION_UPDATE:
      Modal = VersionUpdateModal;
      break;
    case ModalName.CHANGE_DATE:
      Modal = ChangeDateModal;
      break;
    case ModalName.COMMISSION:
      Modal = CommissionModal;
      break;
    case ModalName.COLLECTION:
      Modal = CollectionModal;
      break;
    case ModalName.REPORTS_TNC:
      Modal = ReportsTnc;
      break;
  }
  if (Modal) {
    return <Modal {...data} complete={complete} />;
  }

  return null;
};

export default ModalManager;
