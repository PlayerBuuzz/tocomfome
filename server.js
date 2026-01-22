import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const PORT = process.env.PORT || 3000;
const server = http.createServer();
const wss = new WebSocketServer({ server });

let mesas = [];

const ranking = {
  "4": 1, "5": 2, "6": 3, "7": 4,
  "Q": 5, "J": 6, "K": 7, "A": 8
};

function valorCarta(carta) {
  return ranking[carta[0]];
}

function criarMesa(ws) {
  const mesa = {
    id: Date.now(),
    jogadores: [ws],
    cartasJogadas: [],
    pontos: [0, 0]
  };
  mesas.push(mesa);
  return mesa;
}

function procurarMesa() {
  return mesas.find(m => m.jogadores.length === 1);
}

function distribuirCartas() {
  const baralho = [
    "4♠","5♠","6♠","7♠","Q♠","J♠","K♠","A♠",
    "4♥","5♥","6♥","7♥","Q♥","J♥","K♥","A♥",
    "4♦","5♦","6♦","7♦","Q♦","J♦","K♦","A♦",
    "4♣","5♣","6♣","7♣","Q♣","J♣","K♣","A♣"
  ];
  const embaralhado = baralho.sort(() => Math.random() - 0.5);
  return [embaralhado.slice(0, 3), embaralhado.slice(3, 6)];
}

wss.on("connection", (ws) => {
  console.log("Jogador conectado");

  let mesa = procurarMesa();

  if (mesa) {
    mesa.jogadores.push(ws);

    mesa.jogadores.forEach(j => j.send(JSON.stringify({ type: "START_GAME" })));

    const [cartasJogador1, cartasJogador2] = distribuirCartas();
    console.log("Cartas distribuídas:", cartasJogador1, cartasJogador2);

    mesa.jogadores[0].send(JSON.stringify({ type: "DEAL_CARDS", cards: cartasJogador1 }));
    mesa.jogadores[1].send(JSON.stringify({ type: "DEAL_CARDS", cards: cartasJogador2 }));

    mesa.jogadores.forEach((j, idx) => {
      j.on("message", (msg) => {
        const data = JSON.parse(msg);
        if (data.type === "PLAY_CARD") {
          mesa.cartasJogadas.push({ jogador: idx, carta: data.card });

          mesa.jogadores.forEach(p => {
            if (p !== j) p.send(JSON.stringify(data));
          });

          if (mesa.cartasJogadas.length === 2) {
            const [c1, c2] = mesa.cartasJogadas;
            const v1 = valorCarta(c1.carta);
            const v2 = valorCarta(c2.carta);

            let vencedor = -1;
            if (v1 > v2) {
              mesa.pontos[c1.jogador]++;
              vencedor = c1.jogador;
            } else if (v2 > v1) {
              mesa.pontos[c2.jogador]++;
              vencedor = c2.jogador;
            }

            mesa.jogadores.forEach(p => {
              p.send(JSON.stringify({
                type: "ROUND_RESULT",
                vencedor,
                pontos: mesa.pontos
              }));
            });

            mesa.cartasJogadas = [];
          }
        }
      });
    });

  } else {
    criarMesa(ws);
    ws.send(JSON.stringify({ type: "WAITING" }));

    // DEBUG: distribui cartas mesmo sozinho para testar
    const [cartasJogador1] = distribuirCartas();
    ws.send(JSON.stringify({ type: "DEAL_CARDS", cards: cartasJogador1 }));
  }

  ws.on("close", () => {
    mesas = mesas.filter(m => !m.jogadores.includes(ws));
  });
});

server.listen(PORT, () => {
  console.log("Servidor Truco rodando na porta", PORT);
});
