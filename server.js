import http from "http";
import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 3000;

// Render exige servidor HTTP ativo
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Truco server rodando");
});

const wss = new WebSocketServer({ server });

let fila = [];

// 🃏 Baralho Truco
const baralhoBase = [
  "4♣","5♣","6♣","7♣","Q♣","J♣","K♣","A♣","2♣","3♣",
  "4♦","5♦","6♦","7♦","Q♦","J♦","K♦","A♦","2♦","3♦",
  "4♥","5♥","6♥","7♥","Q♥","J♥","K♥","A♥","2♥","3♥",
  "4♠","5♠","6♠","7♠","Q♠","J♠","K♠","A♠","2♠","3♠"
];

function embaralhar(baralho) {
  return [...baralho].sort(() => Math.random() - 0.5);
}

function criarMesa(j1, j2) {
  const baralho = embaralhar(baralhoBase);

  const mao1 = baralho.splice(0, 3);
  const mao2 = baralho.splice(0, 3);

  const mesa = { jogadores: [j1, j2], turno: 0 };
  j1.mesa = mesa;
  j2.mesa = mesa;

  j1.send(JSON.stringify({
    type: "START",
    cartas: mao1,
    suaVez: true
  }));

  j2.send(JSON.stringify({
    type: "START",
    cartas: mao2,
    suaVez: false
  }));
}

wss.on("connection", (ws) => {
  console.log("🟢 Jogador conectado");

  ws.mesa = null;

  if (fila.length > 0) {
    const oponente = fila.shift();
    criarMesa(oponente, ws);
  } else {
    fila.push(ws);
    ws.send(JSON.stringify({ type: "WAIT" }));
  }

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    if (!ws.mesa) return;

    if (data.type === "PLAY") {
      const [j1, j2] = ws.mesa.jogadores;
      const outro = ws === j1 ? j2 : j1;

      outro.send(JSON.stringify({
        type: "OPPONENT_PLAY",
        carta: data.carta
      }));

      ws.send(JSON.stringify({ type: "WAIT_TURN" }));
      outro.send(JSON.stringify({ type: "YOUR_TURN" }));
    }
  });

  ws.on("close", () => {
    fila = fila.filter(j => j !== ws);
    console.log("🔴 Jogador desconectou");
  });
});

server.listen(PORT, () => {
  console.log("🃏 Truco Online rodando na porta", PORT);
});
