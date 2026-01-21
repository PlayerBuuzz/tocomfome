import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const PORT = process.env.PORT || 3000;

// Servidor HTTP (Render precisa disso)
const server = http.createServer();

const wss = new WebSocketServer({ server });

let mesas = [];

function criarMesa(ws) {
  const mesa = {
    id: Date.now(),
    jogadores: [ws]
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

    mesa.jogadores.forEach(jogador => {
      jogador.send(JSON.stringify({ type: "START_GAME" }));
    });

  } else {
    criarMesa(ws);
    ws.send(JSON.stringify({ type: "WAITING" }));
  }

  ws.on("close", () => {
    mesas = mesas.filter(m => !m.jogadores.includes(ws));
  });
});

// Render escuta aqui
server.listen(PORT, () => {
  console.log("Servidor Truco rodando na porta", PORT);
});
