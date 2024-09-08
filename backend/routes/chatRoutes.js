import express from "express";
const router = express.Router();

export default function (io) {
  io.on("connection", (socket) => {
    console.log("New user connected");

    socket.on("chat message", (msg) => {
      io.emit("chat message", msg);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return router;
}
