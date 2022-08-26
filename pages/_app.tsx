import React, { useEffect, useState } from 'react';
import { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import AppActions from '../redux/actions/AppAction';
import createStore from '../redux/store';
import '../css/app.css';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import NiyoPage from '../utils/NiyoPage';
import MultipleTabAlert from '../components/MultipleTabAlert';
import Toast from '../components/Toast';
import ToastStack from '../components/ToastStack';

const App = ({ Component, pageProps }: AppProps) => {
  const [showApp, setShowApp] = useState(true);
  const store = createStore(undefined);

  useEffect(() => {
    store.dispatch(AppActions.initialize());
    checkMultipleTabs();
  }, []);

  let channel = null;
  if (typeof BroadcastChannel !== 'undefined') {
    /*eslint-disable */
    channel = React.useMemo(() => new BroadcastChannel('tab'), []);
  }

  const checkMultipleTabs = () => {
    channel.postMessage('another-tab');
    channel.addEventListener('message', msg => {
      if (msg.data === 'another-tab') {
        setShowApp(false);
      }
    });
  };

  return showApp ? (
    <Provider store={store}>
      <NiyoPage Component={Component} {...pageProps} />
      <Toast />
      <ToastStack />
    </Provider>
  ) : (
    <MultipleTabAlert channel={channel} setShowApp={setShowApp} />
  );
};

export default App;
