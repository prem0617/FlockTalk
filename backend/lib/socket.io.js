import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";

const app = express();

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

export const getReciverSocketId = (reciverId) => {
  return users[reciverId];
};

const users = {};

io.on("connection", (socket) => {
  console.log(`connection: ${socket.id}`);

  const userId = socket.handshake.query.userId;

  users[userId] = socket.id;

  // console.log(users);

  socket.on("disconnect", () => {
    console.log(`disconnect: ${socket.id}`);
  });
});

export { app, server, io };
