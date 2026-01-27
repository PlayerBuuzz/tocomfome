importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyD6a29L24aFSgVjmC7NFGXpdWW4g1uQsio",
  authDomain: "tocomfome-754e1.firebaseapp.com",
  projectId: "tocomfome-754e1",
  storageBucket: "tocomfome-754e1.firebasestorage.app",
  messagingSenderId: "997975886937",
  appId: "1:997975886937:web:9bf408c35f1ed8aea13548"
});

const messaging = firebase.messaging();

/**
 * 🔔 Mensagem recebida com o site FECHADO
 */
messaging.onBackgroundMessage(function(payload) {
  console.log("[SW] Notificação recebida:", payload);

  const notificationTitle = payload.notification?.title || "🍔 Novo pedido";
  const notificationOptions = {
    body: payload.notification?.body || "Você recebeu um novo pedido",
    icon: "/icon.png",
    data: {
      url: "/painel-comercio.html"
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * 👉 Clique na notificação
 */
self.addEventListener("notificationclick", function(event) {
  event.notification.close();

  const url = event.notification.data?.url || "/painel-comercio.html";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then(function(clientList) {
        for (const client of clientList) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
