const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const users = {};
const connections = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  users[socket.id] = { x: 100, y: 100, name: "Player" };
  connections[socket.id] = new Set();

  socket.emit("initUsers", users);
    socket.emit("users:list", Object.values(users).map(u => ({ userId: u.id, username: u.name, position: { x: u.x, y: u.y }, color: "#00d4ff" })));

    // React client join handler
    socket.on("user:join", ({ userId, username, position }) => {
      users[socket.id] = { x: position?.x || 400, y: position?.y || 300, name: username || "Player", id: userId };
      connections[socket.id] = new Set();
      socket.emit("users:list", Object.values(users).map(u => ({ userId: u.id || socket.id, username: u.name, position: { x: u.x, y: u.y }, color: "#00d4ff" })));
      socket.broadcast.emit("user:joined", { userId: socket.id, username: users[socket.id].name, position: { x: users[socket.id].x, y: users[socket.id].y }, color: "#00d4ff" });
    });

    // React client move handler
    socket.on("user:move", ({ userId, position }) => {
      if (users[socket.id]) {
        users[socket.id].x = position.x;
        users[socket.id].y = position.y;
        socket.broadcast.emit("user:moved", { userId: socket.id, position });
        checkProximity(socket.id);
      }
    });

    // React client chat message handler - broadcast to all (both will see messages)
    socket.on("chat:message", ({ fromUserId, toUserId, message }) => {
      const fromUser = users[socket.id];
      if (!fromUser) return;
      
      const msgData = {
        fromUserId: socket.id,
        fromUsername: fromUser.name,
        message,
        timestamp: new Date().toISOString(),
      };
      
      // Broadcast to ALL clients so both sender and receiver see it
      io.emit("chat:message", msgData);
    });

  socket.on("move", ({ x, y, name }) => {
    users[socket.id] = { x, y, name: name || "Player" };

    socket.broadcast.emit("userMoved", {
      id: socket.id,
      x,
      y,
      name,
    });
    socket.broadcast.emit("user:moved", {
      userId: socket.id,
      position: { x, y },
    });

    checkProximity(socket.id);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    delete connections[socket.id];

    io.emit("userLeft", socket.id);
  });
});

const CONNECT_RADIUS = 100;
const DISCONNECT_RADIUS = 120;

function checkProximity(userId) {
  const user = users[userId];

  for (let otherId in users) {
    if (otherId === userId) continue;

    const other = users[otherId];

    const dx = user.x - other.x;
    const dy = user.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const isConnected = connections[userId].has(otherId);

    if (distance < CONNECT_RADIUS && !isConnected) {
      connections[userId].add(otherId);

      io.to(userId).emit("chatEnabled", otherId);
      io.to(otherId).emit("chatEnabled", userId);
      io.to(userId).emit("proximity:connected", { userId: otherId, username: users[otherId]?.name || "User" });
      io.to(otherId).emit("proximity:connected", { userId: userId, username: users[userId]?.name || "User" });
    }

    if (distance > DISCONNECT_RADIUS && isConnected) {
      connections[userId].delete(otherId);

      io.to(userId).emit("chatDisabled", otherId);
      io.to(otherId).emit("chatDisabled", userId);
      io.to(userId).emit("proximity:disconnected", { userId: otherId, username: users[otherId]?.name || "User" });
      io.to(otherId).emit("proximity:disconnected", { userId: userId, username: users[userId]?.name || "User" });
    }
  }
}

server.listen(5001, () => {
  console.log("Server running on port 5001");
});
