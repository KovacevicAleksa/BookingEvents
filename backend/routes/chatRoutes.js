import express from "express";
const router = express.Router();

export default function (io) {
  const rooms = new Map();

  io.on("connection", (socket) => {
    console.log("New user connected");

    // Get the user's email from the client
    socket.on("user email", (email) => {
      socket.userEmail = email;
      console.log(`User ${email} connected`);
    });

    socket.on("join room", (room) => {
      socket.join(room);
      if (!rooms.has(room)) {
        rooms.set(room, new Set());
      }
      rooms.get(room).add(socket.id);
      console.log(
        `User ${socket.userEmail || "Anonymous"} joined room ${room}`
      );
      io.to(room).emit("active users", rooms.get(room).size);
    });

    socket.on("leave room", (room) => {
      socket.leave(room);
      if (rooms.has(room)) {
        rooms.get(room).delete(socket.id);
        if (rooms.get(room).size === 0) {
          rooms.delete(room);
        } else {
          io.to(room).emit("active users", rooms.get(room).size);
        }
      }
      console.log(`User ${socket.userEmail || "Anonymous"} left room ${room}`);
    });

    socket.on("chat message", ({ room, message }) => {
      io.to(room).emit("chat message", {
        text: message,
        email: socket.userEmail || "Anonymous",
      });
    });

    socket.on("disconnect", () => {
      rooms.forEach((users, room) => {
        if (users.has(socket.id)) {
          users.delete(socket.id);
          if (users.size === 0) {
            rooms.delete(room);
          } else {
            io.to(room).emit("active users", users.size);
          }
        }
      });
      console.log(`User ${socket.userEmail || "Anonymous"} disconnected`);
    });
  });

  return router;
}
