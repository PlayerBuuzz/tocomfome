const status = document.getElementById("status");
const oponente = document.getElementById("oponente");
const maoJogador = document.getElementById("mao-jogador");
const maoOponente = document.getElementById("mao-oponente");

// ⚠️ Troque pelo domínio EXATO do seu servidor Render
const ws = new WebSocket("wss://truco-da-sorte.onrender.com");

ws.onopen = () => {
  status.innerHTML = "🔗 Conectado ao servidor";
};

ws.onmessage = (msg) => {
  const data = JSON.parse(msg.data);

  if (data.type === "WAITING") {
    status.innerHTML = "⏳ Aguardando oponente...";
    status.className = "centro aguardando";
  }

  if (data.type === "START_GAME") {
    status.innerHTML = "🎉 Oponente encontrado!";
    status.className = "centro jogando";
    oponente.innerHTML = "🧑 Oponente conectado";

    // Renderiza cartas recebidas
    maoJogador.innerHTML = "";
    data.hand.forEach(carta => {
      const div = document.createElement("div");
      div.className = "carta";
      div.textContent = carta;
      div.onclick = () => jogarCarta(carta);
      maoJogador.appendChild(div);
    });
  }

  if (data.type === "CARD_PLAYED") {
    const div = document.createElement("div");
    div.className = "carta";
    div.textContent = data.carta;
    maoOponente.appendChild(div);
  }

  if (data.type === "TRUCO") {
    status.innerHTML = "🔥 Oponente pediu TRUCO!";
  }
};

ws.onerror = () => {
  status.innerHTML = "❌ Erro de conexão";
};

function jogarCarta(carta) {
  ws.send(JSON.stringify({ type: "PLAY_CARD", carta }));
}

function pedirTruco() {
  ws.send(JSON.stringify({ type: "TRUCO" }));
}
