import WebSocket from "ws";

const PORT = process.env.PORT || 10000;
const wss = new WebSocket.Server({ port: PORT });

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

    mesa.jogadores.forEach((jogador, i) => {
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
    mesas = mesas.filter(m => !m.jogadores.includes(ws));
  });
});

console.log("🃏 Servidor Truco rodando");
