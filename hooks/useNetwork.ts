import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import AppActions from '../redux/actions/AppAction';

const mapRootState = (rootState: RootState) => {
  return {
    networkError: rootState.appState.ui.networkError,
    fetchingExternalApi: rootState.appState.ui.fetchingExternalApi,
  };
};

const useNetwork = () => {
  const dispatch = useDispatch();
  const [browserOnline, setBrowserOnline] = useState(window.navigator.onLine);
  const { networkError, fetchingExternalApi } = useSelector(mapRootState);
  const apiOnline = !networkError;

  const externalApiFetchCheck = async () => {
    dispatch(AppActions.fetchingExternalApi(true));
    try {
      const interval = setInterval(async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 29 * 1000);
        await fetch('https://www.1knetworks.com', {
          method: 'GET',
          mode: 'no-cors',
          signal: controller.signal,
        }); // To Build Niyoos end point instead of this endpoint
        dispatch(AppActions.updateNetworkError(false));
        dispatch(AppActions.fetchingExternalApi(false));
        clearTimeout(timeout);
        clearInterval(interval);
      }, 30 * 1000);
    } catch (e) {
      dispatch(AppActions.updateNetworkError(true));
    }
    return;
  };

  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Below useEffect is called whenever window.navigator.onLine shows online but POS API fails due to network error.
  useEffect(() => {
    if (browserOnline && !apiOnline && !fetchingExternalApi)
      externalApiFetchCheck();
  }, [browserOnline, apiOnline, fetchingExternalApi]);

  if (!browserOnline) return browserOnline;
  return apiOnline;
};

export default useNetwork;
