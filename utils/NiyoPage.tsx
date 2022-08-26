import { RootState } from '../redux/store';
import { useSelector, useDispatch } from 'react-redux';
import AppAction from '../redux/actions/AppAction';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useScheduler from '../hooks/useScheduler';
import Storage, { StorageKey } from './Storage';
import Toolkit from './Toolkit';
import { ModalName } from '../types/Modal';
import { SyncName } from '../types/Sync';

const mapRootState = (rootState: RootState) => {
  return {
    token: rootState.appState.token,
    isInitialized: rootState.appState.isInitialized,
    syncs: rootState.appState.syncs,
  };
};

const beforeUnloadListener = event => {
  event.preventDefault();
  return (event.returnValue = 'Are you sure you want to exit?');
};

const NiyoPage = ({ Component, ...pageProps }) => {
  const [isSyncing, setIsSyncing] = useState(true);
  const { token, isInitialized, syncs } = useSelector(mapRootState);
  const router = useRouter();
  const isPrivate = (Component as any).isPrivate;
  const blockAccess = (isPrivate === undefined || isPrivate === true) && !token;
  const dispatch = useDispatch();

  useScheduler();

  if (typeof BroadcastChannel !== 'undefined') {
    const notification = new BroadcastChannel('fcm-notification');
    notification.onmessage = event => {
      const { title, body } = event.data.notification;
      dispatch(
        AppAction.pushToast({
          title: title,
          description: body,
        })
      );
    };
  }

  useEffect(() => {
    const isOnline = window.navigator.onLine;
    if (!isOnline) return;
    const store = Storage.get(StorageKey.STORE, null);
    if (store) {
      const version_update = Toolkit.compareMinVersion(
        parseFloat(store.settings.min_app_version),
        parseFloat(process.env.NEXT_PUBLIC_APP_VERSION)
      );
      if (version_update) {
        dispatch(AppAction.switchModal(ModalName.VERSION_UPDATE));
      }
    }
  }, []);

  useEffect(() => {
    if (isInitialized && blockAccess) {
      router.push('/login');
    }
  }, [blockAccess, isInitialized]);

  // this useEffect determines whether local orders are syncing
  useEffect(() => {
    Object.keys(syncs).map(syncName => {
      if (syncs[SyncName.ORDER_LOCAL].status == 'in_progress') {
        return setIsSyncing(true);
      } else setIsSyncing(false);
    });
  }, [syncs]);
  // if local orders are syncing, below code runs and popup opens
  useEffect(() => {
    if (isSyncing) {
      window.addEventListener('beforeunload', beforeUnloadListener, {
        capture: true,
      });
    } else {
      window.removeEventListener('beforeunload', beforeUnloadListener, {
        capture: true,
      });
    }
  }, [isSyncing]);

  if (!isInitialized || blockAccess) {
    return null;
  }

  return <Component {...pageProps} />;
};

export default NiyoPage;
