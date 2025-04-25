import { Server } from "socket.io";
import config from "./config";

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: config.get('clientURL'),
      methods: ['GET', 'POST'],
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 New client connected");

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected");
    });

    socket.on("sendNotification", (data) => {
      console.log("📤 Notification sent:", data);
      io.emit("receiveNotification", data);
    });
  });
}

export function getIO() {
  if (!io)  throw new Error("Socket.io not initialized");
  return io;
}
