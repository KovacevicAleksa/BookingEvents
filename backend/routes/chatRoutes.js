import express from "express";
import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg; // Destructuring Pool from pg package

dotenv.config(); // Load environment variables from .env file

const router = express.Router(); // Creating a new Express router

// PostgreSQL connection pool configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Connection string from environment variable
});

// Test connection to the database
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error connecting to the database", err); // Log error if connection fails
  } else {
    console.log("Successfully connected to the PostgreSQL"); // Log success message
  }
});

// Exporting a function that takes io as a parameter
export default function (io) {
  const rooms = new Map(); // Map to keep track of rooms and connected users

  // Helper function to save messages to the database
  async function saveMessage(room, email, message) {
    const query =
      "INSERT INTO messages (room, email, message, timestamp) VALUES ($1, $2, $3, NOW())"; // SQL query to insert a message
    try {
      await pool.query(query, [room, email, message]); // Execute the query
      console.log(`Saved message in room ${room} from ${email}`); // Log success message
    } catch (error) {
      console.error("Error saving message:", error); // Log error if saving fails
    }
  }

  // Helper function to retrieve messages from the database
  async function getMessages(room) {
    const query =
      "SELECT * FROM messages WHERE room = $1 ORDER BY timestamp ASC"; // SQL query to select messages from a room
    try {
      const result = await pool.query(query, [room]); // Execute the query
      return result.rows; // Return the retrieved messages
    } catch (error) {
      console.error("Error retrieving messages:", error); // Log error if retrieval fails
      return []; // Return an empty array on error
    }
  }

  // Socket.io connection handler
  io.on("connection", (socket) => {
    console.log("New user connected"); // Log when a new user connects

    // Get the user's email from the client
    socket.on("user email", (email) => {
      socket.userEmail = email; // Store the user's email in the socket
      console.log(`User ${email} connected`); // Log the connected user's email
    });

    // Handle joining a room
    socket.on("join room", async (room) => {
      socket.join(room); // Add socket to the specified room
      if (!rooms.has(room)) {
        rooms.set(room, new Set()); // Create a new Set for the room if it doesn't exist
      }
      rooms.get(room).add(socket.id); // Add the socket ID to the room's user set
      console.log(
        `User ${socket.userEmail || "Anonymous"} joined room ${room}` // Log user joining the room
      );
      io.to(room).emit("active users", rooms.get(room).size); // Emit the number of active users in the room

      // Send previous messages to the user
      const messages = await getMessages(room); // Retrieve messages for the room
      socket.emit("previous messages", messages); // Send previous messages to the user
    });

    // Handle leaving a room
    socket.on("leave room", (room) => {
      socket.leave(room); // Remove socket from the specified room
      if (rooms.has(room)) {
        rooms.get(room).delete(socket.id); // Remove the socket ID from the room's user set
        if (rooms.get(room).size === 0) {
          rooms.delete(room); // Delete the room if no users are left
        } else {
          io.to(room).emit("active users", rooms.get(room).size); // Emit the updated number of active users
        }
      }
      console.log(`User ${socket.userEmail || "Anonymous"} left room ${room}`); // Log user leaving the room
    });

    // Handle receiving a chat message
    socket.on("chat message", async ({ room, message }) => {
      const email = socket.userEmail || "Anonymous"; // Get the user's email or use "Anonymous"
      await saveMessage(room, email, message); // Save the message to the database
      const messageObject = {
        text: message,
        email: email,
        timestamp: new Date(), // Create a message object with text, email, and timestamp
      };
      console.log("Emitting chat message:", messageObject); // Log the message being emitted
      io.to(room).emit("chat message", messageObject); // Emit the chat message to the room
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      rooms.forEach((users, room) => {
        if (users.has(socket.id)) {
          users.delete(socket.id); // Remove the socket ID from the room's user set
          if (users.size === 0) {
            rooms.delete(room); // Delete the room if no users are left
          } else {
            io.to(room).emit("active users", users.size); // Emit the updated number of active users
          }
        }
      });
      console.log(`User ${socket.userEmail || "Anonymous"} disconnected`); // Log user disconnection
    });
  });

  return router; // Return the router
}
