import { useEffect } from 'react';

const useServiceWorker = () => {
  const initialize = async () => {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/service-worker.js');
        console.debug('Service worker registered');
      } catch (error) {
        console.error('Service worker registration failed', error);
      }
    } else {
      console.log('Service worker not supported');
    }
  };
  useEffect(() => {
    initialize();
  }, []);
};

export default useServiceWorker;
