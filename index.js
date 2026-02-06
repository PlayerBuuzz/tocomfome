const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

/* =========================
   EMAIL CONFIG
========================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "SEU_EMAIL@gmail.com",
    pass: "SUA_SENHA_DE_APP"
  }
});


/* =========================
   FUNÇÃO PRINCIPAL
========================= */

exports.notificarNovoPedido = functions.firestore
  .document("pedidos/{pedidoId}")
  .onCreate(async (snap) => {

    const pedido = snap.data();

    if (!pedido || !pedido.comercioId) return;

    const comercioId = pedido.comercioId;


    /* =========================
       BUSCAR COMÉRCIO
    ========================= */

    const comercioRef = admin
      .firestore()
      .collection("comercios")
      .doc(comercioId);

    const comercioSnap = await comercioRef.get();

    if (!comercioSnap.exists) return;

    const comercio = comercioSnap.data();


    /* =========================
       ENVIAR EMAIL
    ========================= */

    if (comercio.email) {

      const mailOptions = {
        from: "SEU_EMAIL@gmail.com",
        to: comercio.email,
        subject: "🍔 Novo pedido recebido!",
        text: `
Novo pedido no Tô Com Fome!

Cliente: ${pedido.clienteNome || "-"}
Produto: ${pedido.produtoNome}
Valor: R$ ${pedido.valor}

Entre no painel para visualizar.
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Email enviado");
      } catch (err) {
        console.error("❌ Erro email:", err);
      }

    }


    /* =========================
       BUSCAR TOKEN PUSH
    ========================= */

    const tokenSnap = await admin
      .firestore()
      .collection("tokens")
      .doc(comercioId)
      .get();

    if (!tokenSnap.exists) {
      console.log("❌ Token não encontrado");
      return;
    }

    const token = tokenSnap.data().token;


    /* =========================
       ENVIAR PUSH
    ========================= */

    const payload = {

      notification: {
        title: "🍔 Novo Pedido!",
        body: `Pedido de ${pedido.clienteNome || "Cliente"}`
      },

      data: {
        pedidoId: snap.id,
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

      console.error("❌ Erro push:", err);

    }

  });
