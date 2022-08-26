importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyA3xQTunVdpvMcXx6WPDQkXbYMBRshUo6A",
    authDomain: "niyo-pos.firebaseapp.com",
    databaseURL: "https://niyo-pos.firebaseio.com",
    projectId: "niyo-pos",
    storageBucket: "niyo-pos.appspot.com",
    messagingSenderId: "614412990222",
    appId: "1:614412990222:web:1aa4b91a9d7d63d785495f",
    measurementId: "G-KE4PBWXLE8"
};
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notification = new BroadcastChannel('fcm-notification');
    notification.postMessage(payload);
    const { title, body } = payload.notification;
    const notificationOptions = {
        body: body,
        icon: '/images/logo.png'
    };
    self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const pathname = event.notification?.data?.FCM_MSG?.notification?.data?.link;
    if (!pathname) return;
    const url = new URL(pathname, self.location.origin).href;

    event.waitUntil(
        self.clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientsArr) => {
                const hadWindowToFocus = clientsArr.some((windowClient) =>
                    windowClient.url === url ? (windowClient.focus(), true) : false
                )

                if (!hadWindowToFocus)
                    self.clients
                        .openWindow(url)
                        .then((windowClient) => windowClient ? windowClient.focus() : null)
            })
    )
});
