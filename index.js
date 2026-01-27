const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Configuração do transporte SMTP (exemplo com Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "SEU_EMAIL@gmail.com",
    pass: "SUA_SENHA_DE_APP" // precisa ser senha de app, não a senha normal
  }
});

exports.enviarEmailPedido = functions.firestore
  .document("pedidos/{pedidoId}")
  .onCreate(async (snap, context) => {
    const pedido = snap.data();

    // Buscar e-mail do comércio
    const comercioSnap = await admin.firestore()
      .collection("comercios")
      .doc(pedido.comercioId)
      .get();

    if (!comercioSnap.exists) return;
    const comercio = comercioSnap.data();
    const emailComercio = comercio.email;

    if (!emailComercio) {
      console.log("Comércio sem e-mail cadastrado");
      return;
    }

    // Montar mensagem
    const mailOptions = {
      from: "SEU_EMAIL@gmail.com",
      to: emailComercio,
      subject: "🍔 Novo pedido recebido!",
      text: `Cliente: ${pedido.clienteNome}\nProduto: ${pedido.produtoNome}\nValor: R$ ${pedido.valor}`
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("E-mail enviado para:", emailComercio);
    } catch (error) {
      console.error("Erro ao enviar e-mail:", error);
    }
  });
