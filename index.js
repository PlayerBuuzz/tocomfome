const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * 🔔 Notificar novo pedido
 * Essa função dispara automaticamente quando um documento é criado em "pedidos"
 */
exports.notificarNovoPedido = functions.firestore
  .document("pedidos/{pedidoId}")
  .onCreate(async (snap, context) => {
    const pedido = snap.data();
    const comercioId = pedido.comercioId;

    // Buscar tokens do comércio
    const tokensSnap = await admin.firestore()
      .collection("comercios")
      .doc(comercioId)
      .collection("tokens")
      .get();

    const tokens = tokensSnap.docs.map(doc => doc.id);

    if (tokens.length === 0) {
      console.log("Nenhum token encontrado para o comércio:", comercioId);
      return;
    }

    // Mensagem de notificação
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

    try {
      const response = await admin.messaging().sendMulticast(message);
      console.log("Notificação enviada:", response);
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
    }
  });
