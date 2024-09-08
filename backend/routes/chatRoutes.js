import express from "express";
const router = express.Router();

export default function (io) {
  io.on("connection", (socket) => {
    console.log("New user connected");

    // Get the user's email from the client
    socket.on("user email", (email) => {
      socket.userEmail = email;
      console.log(`User ${email} connected`);
    });

    socket.on("join room", (room) => {
      socket.join(room);
      console.log(
        `User ${socket.userEmail || "Anonymous"} joined room ${room}`
      );
    });

    socket.on("leave room", (room) => {
      socket.leave(room);
      console.log(`User ${socket.userEmail || "Anonymous"} left room ${room}`);
    });

    socket.on("chat message", ({ room, message }) => {
      io.to(room).emit("chat message", {
        text: message,
        email: socket.userEmail || "Anonymous",
      });
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.userEmail || "Anonymous"} disconnected`);
    });
  });

  return router;
}
