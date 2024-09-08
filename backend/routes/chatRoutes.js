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

    socket.on("chat message", (msg) => {
      // Send the message along with the user's email
      io.emit("chat message", {
        text: msg,
        email: socket.userEmail || "Anonymous",
      });
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.userEmail || "Anonymous"} disconnected`);
    });
  });

  return router;
}
