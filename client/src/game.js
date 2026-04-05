import * as PIXI from "pixi.js";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

let app = null;
let player = null;
const players = {};
const keys = {};
const speed = 3;

export async function startGame() {
  console.log("Starting game...");
  
  app = new PIXI.Application();
  
  await app.init({
    width: 800,
    height: 600,
    background: 0x1e1e1e,
  });

  console.log("PixiJS app initialized");
  
  // Append canvas to body
  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";
  document.body.appendChild(app.canvas);

  // Create current player
  player = new PIXI.Graphics();
  player.circle(0, 0, 10);
  player.fill(0x00ffcc);
  player.x = 400;
  player.y = 300;
  app.stage.addChild(player);

  console.log("Player created at", player.x, player.y);

  // Add key listeners
  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
  });

  window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

  // Game loop
  app.ticker.add(() => {
    if (!player) return;

    let moved = false;
    
    if (keys["w"] || keys["ArrowUp"]) {
      player.y -= speed;
      moved = true;
    }
    if (keys["s"] || keys["ArrowDown"]) {
      player.y += speed;
      moved = true;
    }
    if (keys["a"] || keys["ArrowLeft"]) {
      player.x -= speed;
      moved = true;
    }
    if (keys["d"] || keys["ArrowRight"]) {
      player.x += speed;
      moved = true;
    }

    if (moved) {
      socket.emit("move", {
        x: player.x,
        y: player.y,
      });
    }
  });

  // Socket events
  socket.on("initUsers", (users) => {
    console.log("Received users:", users);
    for (let id in users) {
      if (id !== socket.id) {
        createPlayer(id, users[id]);
      }
    }
  });

  socket.on("userMoved", ({ id, x, y }) => {
    console.log("User moved:", id, x, y);
    if (players[id]) {
      players[id].x = x;
      players[id].y = y;
    } else {
      createPlayer(id, { x, y });
    }
  });

  socket.on("userLeft", (id) => {
    console.log("User left:", id);
    if (players[id]) {
      app.stage.removeChild(players[id]);
      delete players[id];
    }
  });

  socket.on("chatEnabled", (id) => {
    console.log("Chat enabled with:", id);
  });

  socket.on("chatDisabled", (id) => {
    console.log("Chat disabled with:", id);
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });
}

function createPlayer(id, pos) {
  console.log("Creating player:", id, pos);
  const graphics = new PIXI.Graphics();
  graphics.circle(0, 0, 10);
  graphics.fill(0xff6b6b);
  graphics.x = pos.x;
  graphics.y = pos.y;
  app.stage.addChild(graphics);
  players[id] = graphics;
}
