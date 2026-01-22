import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const PORT = process.env.PORT || 3000;
const server = http.createServer();
const wss = new WebSocketServer({ server });

let mesas = [];

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
  const baralho = ["4♠","5♠","6♠","7♠","Q♠","J♠","K♠","A♠",
                   "4♥","5♥","6♥","7♥","Q♥","J♥","K♥","A♥",
                   "4♦","5♦","6♦","7♦","Q♦","J♦","K♦","A♦",
                   "4♣","5♣","6♣","7♣","Q♣","J♣","K♣","A♣"];
  const embaralhado = baralho.sort(() => Math.random() - 0.5);
  return embaralhado.slice(0, 6); // 3 cartas pra cada
}

// força das cartas (simplificada)
const ranking = {
  "4": 1, "5": 2, "6": 3, "7": 4,
  "Q": 5, "J": 6, "K": 7, "A": 8
};

function valorCarta(carta) {
  return ranking[carta[0]]; // pega só o número/letra
}

wss.on("connection", (ws) => {
  console.log("Jogador conectado");

  let mesa = procurarMesa();

  if (mesa) {
    mesa.jogadores.push(ws);

    // Inicia jogo
    mesa.jogadores.forEach(jogador => {
      jogador.send(JSON.stringify({ type: "START_GAME" }));
    });

    // Distribui cartas
    const cartas = distribuirCartas();
    mesa.jogadores[0].send(JSON.stringify({ type: "DEAL_CARDS", cards: cartas.slice(0,3) }));
    mesa.jogadores[1].send(JSON.stringify({ type: "DEAL_CARDS", cards: cartas.slice(3,6) }));

    // Recebe jogadas
    mesa.jogadores.forEach((j, idx) => {
      j.on("message", (msg) => {
        const data = JSON.parse(msg);

        if (data.type === "PLAY_CARD") {
          mesa.cartasJogadas.push({ jogador: idx, carta: data.card });

          // repassa jogada pro outro
          mesa.jogadores.forEach(p => {
            if (p !== j) p.send(JSON.stringify(data));
          });

          // se os dois jogaram, comparar
          if (mesa.cartasJogadas.length === 2) {
            const [c1, c2] = mesa.cartasJogadas;
            const v1 = valorCarta(c1.carta);
            const v2 = valorCarta(c2.carta);

            let vencedor;
            if (v1 > v2) {
              mesa.pontos[c1.jogador] += 1;
              vencedor = c1.jogador;
            } else if (v2 > v1) {
              mesa.pontos[c2.jogador] += 1;
              vencedor = c2.jogador;
            } else {
              vencedor = -1; // empate
            }

            // avisa resultado
            mesa.jogadores.forEach((p, i) => {
              p.send(JSON.stringify({
                type: "ROUND_RESULT",
                vencedor,
                pontos: mesa.pontos
              }));
            });

            // limpa jogadas
            mesa.cartasJogadas = [];
          }
        }
      });
    });

  } else {
    criarMesa(ws);
    ws.send(JSON.stringify({ type: "WAITING" }));
  }

  ws.on("close", () => {
    mesas = mesas.filter(m => !m.jogadores.includes(ws));
  });
});

server.listen(PORT, () => {
  console.log("Servidor Truco rodando na porta", PORT);
});
