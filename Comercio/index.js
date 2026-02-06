const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.notificarNovoPedido = functions.firestore
  .document("pedidos/{pedidoId}")
  .onCreate(async (snap, context) => {
    const pedido = snap.data();

    // Buscar token do comércio
    const tokenSnap = await admin.firestore()
      .collection("tokensComercio")
      .doc(pedido.comercioId)
      .get();

    if (!tokenSnap.exists) {
      console.log("❌ Comércio sem token de notificação");
      return null;
    }

    const token = tokenSnap.data().token;

    // Mensagem de notificação
    const message = {
      token: token,
      notification: {
        title: "📦 Novo Pedido!",
        body: `Pedido de ${pedido.clienteNome}: ${pedido.produtoNome}`
      },
      data: {
        pedidoId: context.params.pedidoId,
        comercioId: pedido.comercioId
      }
    };

    try {
      await admin.messaging().send(message);
      console.log("✅ Notificação enviada ao comércio");
    } catch (err) {
      console.error("Erro ao enviar notificação:", err);
    }

    return null;
  });
