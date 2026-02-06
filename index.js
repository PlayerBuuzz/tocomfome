const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.notificarNovoPedido = functions.firestore
  .document("pedidos/{id}")
  .onCreate(async (snap) => {

    const pedido = snap.data();

    if (!pedido || !pedido.comercioId) return;

    const comercioId = pedido.comercioId;

    // Buscar token do comércio
    const tokenDoc = await admin
      .firestore()
      .collection("tokens")
      .doc(comercioId)
      .get();

    if (!tokenDoc.exists) {
      console.log("❌ Token não encontrado:", comercioId);
      return;
    }

    const token = tokenDoc.data().token;

    const payload = {

      notification: {
        title: "🍔 Novo Pedido!",
        body: `Pedido de ${pedido.clienteNome || "Cliente"}`,
      },

      data: {
        pedidoId: snap.id,
        comercioId: comercioId,
        tipo: "novo_pedido"
      },

      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "pedidos"
        }
      },

      apns: {
        payload: {
          aps: {
            sound: "default"
          }
        }
      }

    };

    try {

      const res = await admin.messaging().sendToDevice(token, payload);

      console.log("✅ Push enviado:", res);

      return res;

    } catch (err) {

      console.error("❌ Erro ao enviar push:", err);

    }

  });
