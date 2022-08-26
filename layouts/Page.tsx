import React, { useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useDispatch } from 'react-redux';
import AppActions from '../redux/actions/AppAction';
import ModalManager from '../components/ModalManager';
import Passport from '../components/Passport';
import { getFCMToken } from '../firebase';
import Storage, { StorageKey } from '../utils/Storage';
import { ModalName } from '../types/Modal';

const Page = ({ children }) => {
  const dispatch = useDispatch();
  // TODO: Ask for confirmation before logout in case there is pending data in local
  const logout = () => dispatch(AppActions.logout());

  const logoutConfirm = () => {
    dispatch(
      AppActions.switchModal(ModalName.CONFIRM, {
        action: logout,
        message: 'Are you sure you want to logout?',
        type: 'logout',
      })
    );
  };

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') getFCMToken();
    const is_login = Storage.get(StorageKey.IS_LOGIN, true);
    if (!is_login) {
      dispatch(AppActions.switchModal(ModalName.RELOGIN));
    }
    if (is_login && !Storage.get(StorageKey.TOKEN_GATEWAY, null)) {
      dispatch(AppActions.getGatewayToken());
    }
  }, []);
  const title =
    process.env.NODE_ENV === 'production' ? '1K POS' : '1K POS-DEBUG';
  return (
    <React.Fragment>
      <Head>
        <title>{title}</title>
        <meta
          name="viewport"
          content="initial-scale=1.0, maximum-scale=1.0, user-scalable=0, width=device-width"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <ModalManager />
      <Header logout={logoutConfirm} />
      <Sidebar />
      <div className="content">
        <div className="container">
          <Passport>{children}</Passport>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Page;
