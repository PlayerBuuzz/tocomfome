import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);

// 🔥 WebSocket ACOPLADO AO HTTP
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 10000;

let mesas = [];

function criarBaralho() {
  const valores = ["4","5","6","7","Q","J","K","A","2","3"];
  const naipes = ["♠","♥","♦","♣"];
  let baralho = [];

  valores.forEach(v =>
    naipes.forEach(n =>
      baralho.push({ valor: v, naipe: n })
    )
  );

  return baralho.sort(() => Math.random() - 0.5);
}

wss.on("connection", (ws) => {
  console.log("🟢 Jogador conectado");

  let mesa = mesas.find(m => m.jogadores.length === 1);

  if (!mesa) {
    mesa = {
      jogadores: [ws],
      baralho: criarBaralho()
    };
    mesas.push(mesa);

    ws.send(JSON.stringify({ type: "WAITING" }));
  } else {
    mesa.jogadores.push(ws);

    mesa.jogadores.forEach(jogador => {
      const cartas = mesa.baralho.splice(0, 3);
      jogador.send(JSON.stringify({
        type: "START_GAME",
        cartas
      }));
    });
  }

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    if (data.type === "PLAY_CARD") {
      mesa.jogadores.forEach(j => {
        if (j !== ws) {
          j.send(JSON.stringify({
            type: "OPPONENT_PLAY",
            carta: data.carta
          }));
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("🔴 Jogador saiu");
    mesas = mesas.filter(m => !m.jogadores.includes(ws));
  });
});

// 🚀 HTTP + WS NA MESMA PORTA
server.listen(PORT, () => {
  console.log("🃏 Truco rodando na porta", PORT);
});
