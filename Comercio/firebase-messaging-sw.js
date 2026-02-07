// firebase-messaging-sw.js (compat, funcional)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD6a29L24aFSgVjmC7NFGXpdWW4g1uQsio",
  authDomain: "tocomfome-754e1.firebaseapp.com",
  projectId: "tocomfome-754e1",
  storageBucket: "tocomfome-754e1.appspot.com",
  messagingSenderId: "997975886937",
  appId: "1:997975886937:web:9bf408c35f1ed8aea13548"
});

const messaging = firebase.messaging();

// Listener para notificações em background
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Notificação em background:', payload);

  const notificationTitle = payload.notification?.title || 'Novo pedido';
  const notificationOptions = {
    body: payload.notification?.body || 'Você recebeu uma nova mensagem.',
    icon: '/img/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
