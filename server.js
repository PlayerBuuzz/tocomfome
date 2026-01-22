// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static(__dirname + "/public")); // se quiser servir frontend junto

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Fila de jogadores aguardando
let fila = [];

// Função para distribuir cartas
function distribuirCartas() {
  // Baralho simplificado (Truco Paulista usa 40 cartas, aqui exemplo básico)
  const baralho = [
    "4♠", "5♠", "6♠", "7♠", "Q♠", "J♠", "K♠", "A♠", "2♠", "3♠",
    "4♥", "5♥", "6♥", "7♥", "Q♥", "J♥", "K♥", "A♥", "2♥", "3♥",
    "4♦", "5♦", "6♦", "7♦", "Q♦", "J♦", "K♦", "A♦", "2♦", "3♦",
    "4♣", "5♣", "6♣", "7♣", "Q♣", "J♣", "K♣", "A♣", "2♣", "3♣"
  ];
  const embaralhado = [...baralho].sort(() => Math.random() - 0.5);
  return [embaralhado.slice(0, 3), embaralhado.slice(3, 6)];
}

io.on("connection", (socket) => {
  console.log("Jogador conectado:", socket.id);

  // Adiciona jogador na fila
  fila.push(socket);

  // Se houver pelo menos 2 jogadores, inicia partida
  if (fila.length >= 2) {
    const player1 = fila.shift();
    const player2 = fila.shift();
    const sala = player1.id + "#" + player2.id;

    player1.join(sala);
    player2.join(sala);

    const [cartas1, cartas2] = distribuirCartas();

    io.to(sala).emit("startGame", {
      sala,
      jogadores: [player1.id, player2.id],
      cartas: {
        [player1.id]: cartas1,
        [player2.id]: cartas2
      }
    });
  } else {
    socket.emit("waiting");
  }

  // Jogar carta
  socket.on("playCard", ({ sala, carta }) => {
    socket.to(sala).emit("opponentPlayed", carta);
  });

  // Pedir truco
  socket.on("callTruco", (sala) => {
    socket.to(sala).emit("trucoCalled");
  });

  // Desconectar
  socket.on("disconnect", () => {
    console.log("Jogador saiu:", socket.id);
    fila = fila.filter(s => s.id !== socket.id);
  });
});

// Endpoint simples para teste
app.get("/", (req, res) => {
  res.send("Servidor de Truco Online ativo!");
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
