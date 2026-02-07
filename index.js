const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/* 🔔 Notificar comércio quando criar pedido */
exports.notificarComercio = functions.firestore
  .document("pedidos/{pedidoId}")
  .onCreate(async (snap) => {

    const pedido = snap.data();

    if (!pedido.comercioId) return;

    /* Busca token do comércio */
    const tokenSnap = await admin.firestore()
      .collection("tokens")
      .doc(pedido.comercioId)
      .get();

    if (!tokenSnap.exists) {
      console.log("Comércio sem token");
      return;
    }

    const token = tokenSnap.data().token;

    /* Monta notificação */
    const payload = {
      notification: {
        title: "📦 Novo Pedido!",
        body: `${pedido.produtoNome} - R$ ${pedido.valor}`
      },
      data: {
        pedidoId: snap.id
      }
    };

    /* Envia */
    try {
      await admin.messaging().sendToDevice(token, payload);
      console.log("✅ Push enviado para comércio");
    } catch (err) {
      console.error("❌ Erro push:", err);
    }

  });
