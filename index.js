const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.notificarNovoPedido = functions.firestore
  .document("pedidos/{pedidoId}")
  .onCreate(async (snap, context) => {
    const pedido = snap.data();
    const comercioId = pedido.comercioId;

    const tokensSnap = await admin.firestore()
      .collection("comercios")
      .doc(comercioId)
      .collection("tokens")
      .get();

    const tokens = tokensSnap.docs.map(doc => doc.id);

    if (tokens.length === 0) return;

    const message = {
      tokens: tokens,
      notification: {
        title: "🍔 Novo pedido recebido!",
        body: `${pedido.clienteNome} pediu: ${pedido.produtoNome}`
      },
      data: {
        url: "/painel-comercio.html?pedido=" + context.params.pedidoId
      }
    };

    await admin.messaging().sendMulticast(message);
  });
