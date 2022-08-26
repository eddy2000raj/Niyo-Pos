import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';
import Storage, { StorageKey } from './utils/Storage';
import AppApi from './apis/AppApi';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
};

const app = initializeApp(firebaseConfig);
typeof window !== 'undefined' && getAnalytics(app);
const messaging = getMessaging();

export async function getFCMToken() {
  try {
    let token = Storage.get(StorageKey.FCM_TOKEN, null);
    if (token && Notification.permission === 'granted') {
      return token;
    } else {
      token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
      });
      Storage.set(StorageKey.FCM_TOKEN, token);
      const apiProps = {
        token: Storage.get(StorageKey.TOKEN, null),
        storeId: Storage.get(StorageKey.STORE, null).id,
      };
      await new AppApi(apiProps).fcmToken({ token });
    }
    return token;
  } catch (e) {
    console.log('getFCMToken error', e);
    return undefined;
  }
}
onMessage(messaging, payload => {
  const notification = new BroadcastChannel('fcm-notification');
  notification.postMessage(payload);
});
