import * as Sentry from '@sentry/nextjs';
import Storage, { StorageKey } from './utils/Storage';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const store = Storage.get(StorageKey.STORE, null);
const ignoreErrors = [
  'TypeError: Failed to fetch',
  'TypeError: NetworkError when attempting to fetch resource.',
  'TypeError: Network Error',
  'Error: Network Error',
  'Error: Request failed with status code 500',
];

let latitude = null,
  longitude = null;
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(position => {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
  });
}

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1.0,
  enabled: process.env.NODE_ENV !== 'development',
  ignoreErrors: ignoreErrors,
});

store &&
  Sentry.setUser({
    store: store.id,
    name: store.name,
    city: store.city,
    latitude,
    longitude,
  });
