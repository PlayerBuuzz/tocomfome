let fila = [];

io.on("connection", (socket) => {
  console.log("Conectado:", socket.id);

  fila.push(socket);

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

  socket.on("disconnect", () => {
    console.log("Desconectado:", socket.id);
    fila = fila.filter(s => s.id !== socket.id);
  });
});
