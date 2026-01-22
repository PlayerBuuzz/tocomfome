const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static(__dirname + "/public"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

let waitingPlayer = null;

function distribuirCartas() {
  const baralho = ["4", "5", "6", "7", "Q", "J", "K", "A", "2", "3"];
  const embaralhado = [...baralho].sort(() => Math.random() - 0.5);
  return [embaralhado.slice(0, 3), embaralhado.slice(3, 6)];
}

io.on("connection", (socket) => {
  console.log("Conectado:", socket.id);

  if (waitingPlayer) {
    const player1 = waitingPlayer;
    const player2 = socket;
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

    waitingPlayer = null;
  } else {
    waitingPlayer = socket;
    socket.emit("waiting");
  }

  socket.on("playCard", ({ sala, carta }) => {
    socket.to(sala).emit("opponentPlayed", carta);
  });

  socket.on("callTruco", (sala) => {
    socket.to(sala).emit("trucoCalled");
  });

  socket.on("disconnect", () => {
    console.log("Desconectado:", socket.id);
    if (waitingPlayer?.id === socket.id) {
      waitingPlayer = null;
    }
  });
});

server.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});
