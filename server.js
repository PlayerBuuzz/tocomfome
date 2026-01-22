import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const PORT = process.env.PORT || 3000;
const server = http.createServer();
const wss = new WebSocketServer({ server });

let mesas = [];

function criarBaralho() {
  const naipes = ["♠", "♥", "♦", "♣"];
  const valores = ["4","5","6","7","Q","J","K","A","2","3"];
  let baralho = [];
  for (let v of valores) {
    for (let n of naipes) {
      baralho.push(v + n);
    }
  }
  return baralho.sort(() => Math.random() - 0.5);
}

function criarMesa(ws) {
  const mesa = {
    id: Date.now(),
    jogadores: [ws],
    baralho: criarBaralho(),
    hands: {}
  };
  mesas.push(mesa);
  return mesa;
}

function procurarMesa() {
  return mesas.find(m => m.jogadores.length === 1);
}

wss.on("connection", (ws) => {
  console.log("Jogador conectado");

  let mesa = procurarMesa();

  if (mesa) {
    mesa.jogadores.push(ws);

    // Distribui cartas
    mesa.hands[mesa.jogadores[0]] = mesa.baralho.splice(0,3);
    mesa.hands[mesa.jogadores[1]] = mesa.baralho.splice(0,3);

    mesa.jogadores.forEach((jogador, idx) => {
      jogador.send(JSON.stringify({
        type: "START_GAME",
        hand: mesa.hands[jogador],
        player: idx
      }));
    });

  } else {
    criarMesa(ws);
    ws.send(JSON.stringify({ type: "WAITING" }));
  }

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    if (data.type === "PLAY_CARD") {
      // Envia jogada para o oponente
      let mesa = mesas.find(m => m.jogadores.includes(ws));
      mesa.jogadores.forEach(j => {
        if (j !== ws) {
          j.send(JSON.stringify({ type: "CARD_PLAYED", carta: data.carta }));
        }
      });
    }
    if (data.type === "TRUCO") {
      let mesa = mesas.find(m => m.jogadores.includes(ws));
      mesa.jogadores.forEach(j => {
        if (j !== ws) {
          j.send(JSON.stringify({ type: "TRUCO" }));
        }
      });
    }
  });

  ws.on("close", () => {
    mesas = mesas.filter(m => !m.jogadores.includes(ws));
  });
});

server.listen(PORT, () => {
  console.log("Servidor Truco rodando na porta", PORT);
});
