// firebase-messaging-sw.js (modular, v10)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getMessaging, onBackgroundMessage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

// 🔥 Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD6a29L24aFSgVjmC7NFGXpdWW4g1uQsio",
  authDomain: "tocomfome-754e1.firebaseapp.com",
  projectId: "tocomfome-754e1",
  storageBucket: "tocomfome-754e1.appspot.com",
  messagingSenderId: "997975886937",
  appId: "1:997975886937:web:9bf408c35f1ed8aea13548"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Listener para notificações em background
onBackgroundMessage(messaging, (payload) => {
  console.log("[firebase-messaging-sw.js] Mensagem recebida em background:", payload);

  const notificationTitle = payload.notification?.title || "Novo pedido";
  const notificationOptions = {
    body: payload.notification?.body || "Você recebeu uma nova mensagem.",
    icon: "/img/logo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
