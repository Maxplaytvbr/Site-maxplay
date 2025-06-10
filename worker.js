importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-sw.js');

const firebaseConfig = {
  apiKey: "AIzaSyBQjE2vvEBUkNNkHKhxcVHUB2zyxfFBjy0",
  authDomain: "maxplaytv-aee49.firebaseapp.com",
  projectId: "maxplaytv-aee49",
  storageBucket: "maxplaytv-aee49.firebasestorage.app",
  messagingSenderId: "721372234845",
  appId: "1:721372234845:web:f1d101d9d7e18603d2b9b4"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Notificação recebida em segundo plano: ', payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: payload.notification.icon
  });
});

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  console.log("Service Worker ativo");
});

self.addEventListener("notificationclick", function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('./'));
});
