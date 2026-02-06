const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.notificarNovoPedido = functions.firestore
  .document("pedidos/{id}")
  .onCreate(async (snap) => {

    const pedido = snap.data();

    const comercioId = pedido.comercioId;

    const tokenDoc = await admin
      .firestore()
      .collection("tokens")
      .doc(comercioId)
      .get();

    if(!tokenDoc.exists) return;

    const token = tokenDoc.data().token;

    const payload = {
      notification: {
        title: "🍔 Novo Pedido!",
        body: `Pedido de ${pedido.clienteNome}`,
        icon: "/img/logo.png"
      }
    };

    return admin.messaging().sendToDevice(token, payload);

  });
