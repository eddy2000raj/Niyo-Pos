import { getAnalytics, logEvent } from 'firebase/analytics';
import Storage, { StorageKey } from '../utils/Storage';
import { EventParams, EventParamsOptional } from '../types/Event';
import moment from 'moment';

const store =
  typeof window !== 'undefined' && Storage.get(StorageKey.STORE, null);

let latitude = null,
  longitude = null,
  navigator = typeof window !== 'undefined' && window.navigator;
if (navigator && 'geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(function (position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
  });
}
const trackEvent = (event_name: string, event_params?: EventParamsOptional) => {
  const analytics = getAnalytics();
  const params: EventParams = {
    store: store?.id,
    name: store?.name,
    latitude,
    longitude,
    triggered_at: moment().format('Do MMM YY, h:mm a'),
    ...event_params,
  };
  logEvent(analytics, event_name, params);
};

export default { trackEvent };
