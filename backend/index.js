const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // your frontend port
    methods: ["GET", "POST"]
  }
});

let messageHistory = [];

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Send chat history
  socket.emit("chat history", messageHistory);

  socket.on("send message", (msg) => {
    console.log("📨 Message received:", msg);
    messageHistory.push(msg);
    io.emit("receive message", msg); // Broadcast to all clients
  });

  socket.on("disconnect", () => {
    console.log("🔌 User disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("🚀 Server is running on http://localhost:3001");
});
