import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const PORT = process.env.PORT || 3000;
const server = http.createServer();
const wss = new WebSocketServer({ server });

let mesas = [];

// 🃏 Baralho simples (truco simplificado)
const baralhoBase = [
  "4♣","5♣","6♣","7♣","Q♣","J♣","K♣","A♣","2♣","3♣",
  "4♦","5♦","6♦","7♦","Q♦","J♦","K♦","A♦","2♦","3♦",
  "4♥","5♥","6♥","7♥","Q♥","J♥","K♥","A♥","2♥","3♥",
  "4♠","5♠","6♠","7♠","Q♠","J♠","K♠","A♠","2♠","3♠"
];

function embaralhar(baralho) {
  return [...baralho].sort(() => Math.random() - 0.5);
}

function criarMesa(jogador1, jogador2) {
  const baralho = embaralhar(baralhoBase);

  const mesa = {
    jogadores: [jogador1, jogador2],
    maos: [
      baralho.splice(0, 3),
      baralho.splice(0, 3)
    ],
    turno: 0
  };

  mesas.push(mesa);

  // 🎮 Inicia jogo
  mesa.jogadores.forEach(j => {
    j.send(JSON.stringify({ type: "START_GAME" }));
  });

  // 🃏 Envia cartas
  mesa.jogadores[0].send(JSON.stringify({
    type: "HAND",
    cartas: mesa.maos[0]
  }));

  mesa.jogadores[1].send(JSON.stringify({
    type: "HAND",
    cartas: mesa.maos[1]
  }));

  // 👉 Primeiro jogador começa
  mesa.jogadores[0].send(JSON.stringify({ type: "YOUR_TURN" }));
  mesa.jogadores[1].send(JSON.stringify({ type: "WAIT_TURN" }));
}

wss.on("connection", (ws) => {
  console.log("Jogador conectado");

  ws.mesa = null;

  const esperando = mesas.find(m => m.jogadores.length === 1);

  if (esperando) {
    esperando.jogadores.push(ws);
    ws.mesa = esperando;
    esperando.jogadores[0].mesa = esperando;

    criarMesa(esperando.jogadores[0], ws);
  } else {
    mesas.push({ jogadores: [ws] });
    ws.send(JSON.stringify({ type: "WAITING" }));
  }

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    if (data.type === "PLAY_CARD") {
      const mesa = mesas.find(m => m.jogadores.includes(ws));
      if (!mesa) return;

      const idx = mesa.jogadores.indexOf(ws);
      const outro = mesa.jogadores[1 - idx];

      // envia carta pro oponente
      outro.send(JSON.stringify({
        type: "OPPONENT_PLAY",
        carta: data.carta
      }));

      // troca turno
      ws.send(JSON.stringify({ type: "WAIT_TURN" }));
      outro.send(JSON.stringify({ type: "YOUR_TURN" }));
    }
  });

  ws.on("close", () => {
    mesas = mesas.filter(m => !m.jogadores.includes(ws));
  });
});

server.listen(PORT, () => {
  console.log("🃏 Servidor Truco rodando na porta", PORT);
});
