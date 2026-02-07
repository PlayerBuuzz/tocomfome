const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.notificarComercio = functions.firestore
  .document("pedidos/{pedidoId}")
  .onCreate(async (snap) => {

    const pedido = snap.data();

    if (!pedido.comercioId) return;

    const tokenDoc = await admin.firestore()
      .collection("tokens")
      .doc(pedido.comercioId)
      .get();

    if (!tokenDoc.exists) {
      console.log("Sem token");
      return;
    }

    const token = tokenDoc.data().token;

    const message = {
      token: token,

      notification: {
        title: "📦 Novo Pedido!",
        body: `${pedido.produtoNome} - R$ ${pedido.valor}`
      },

      webpush: {
        headers: {
          Urgency: "high"
        },
        notification: {
          icon: "/img/logo.png",
          requireInteraction: true
        }
      }
    };

    try {
      await admin.messaging().send(message);
      console.log("✅ Push enviado");
    } catch (e) {
      console.error("❌ Erro push:", e);
    }

  });
