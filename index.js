const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.notificarComercio = functions.firestore
  .document("pedidos/{pedidoId}")
  .onCreate(async (snap) => {

    const pedido = snap.data();

    if (!pedido.comercioId) {
      console.log("Pedido sem comercioId");
      return;
    }

    const tokenSnap = await admin.firestore()
      .collection("tokens")
      .doc(pedido.comercioId)
      .get();

    if (!tokenSnap.exists) {
      console.log("Token não encontrado");
      return;
    }

    const token = tokenSnap.data().token;

    console.log("Enviando para token:", token);

    const message = {
      token,

      notification: {
        title: "📦 Novo Pedido!",
        body: `${pedido.produtoNome} - R$ ${pedido.valor}`
      },

      webpush: {
        notification: {
          icon: "/img/logo.png",
          requireInteraction: true
        },
        fcmOptions: {
          link: "/comandas.html"
        }
      }
    };

    try {
      const res = await admin.messaging().send(message);
      console.log("Push enviado:", res);
    } catch (err) {
      console.error("Erro push:", err);
    }

  });
