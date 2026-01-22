const socket = io("https://truco-da-sorte.onrender.com"); // seu backend no Render

function joinRoom() {
  const room = document.getElementById("roomInput").value;
  socket.emit("joinRoom", room);
  document.getElementById("roomName").textContent = room;
  document.getElementById("gameArea").style.display = "block";
}

function playCard(card) {
  const room = document.getElementById("roomName").textContent;
  socket.emit("playCard", { roomId: room, card });
}

function callTruco() {
  const room = document.getElementById("roomName").textContent;
  socket.emit("callTruco", room);
}

socket.on("startGame", () => {
  addMessage("Partida iniciada!");
});

socket.on("opponentPlayed", (card) => {
  addMessage(`Oponente jogou: ${card}`);
});

socket.on("trucoCalled", () => {
  addMessage("Oponente pediu TRUCO!");
});

function addMessage(msg) {
  const li = document.createElement("li");
  li.textContent = msg;
  document.getElementById("messages").appendChild(li);
}
