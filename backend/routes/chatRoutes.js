import express from "express";
import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg; // Destructuring Pool from pg package

dotenv.config(); // Load environment variables from .env file

const router = express.Router(); // Creating a new Express router

// Initialize pool variable outside if/else blocks
let pool;

// Configure pool based on environment
if (process.env.NODE_ENV === 'test') {
  pool = new Pool({
    host: 'localhost',
    user: process.env.PG_USER,
    password: process.env.PG_PASS,
    database: process.env.PG_TEST_DB || 'test_db',
    port: 5432,
  });
} else {
  pool = new Pool({
    host: process.env.PG_HOST || "postgres",
    user: process.env.PG_USER,
    password: process.env.PG_PASS,
    database: process.env.PG_DB,
    port: 5432,
  });
}

if(process.env.NODE_ENV!=="test"){
// Test connection to the database
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.log(process.env.NODE_ENV);
    console.error("Error connecting to the database", err); // Log error if connection fails
  } else {
    console.log("Successfully connected to the PostgreSQL"); // Log success message
  }
});}

export default function (io) {
  const rooms = new Map(); // Map to keep track of rooms and connected users

  // Helper function to get or create a user
  async function getOrCreateUser(email) {
    const query = `
      INSERT INTO message_system.users (email)
      VALUES ($1)
      ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
      RETURNING user_id
    `;
    try {
      const result = await pool.query(query, [email]);
      return result.rows[0].user_id;
    } catch (error) {
      console.error("Error getting or creating user:", error);
      return null;
    }
  }

  // Helper function to get or create a room
  async function getOrCreateRoom(roomName) {
    const query = `
      INSERT INTO message_system.rooms (room_name)
      VALUES ($1)
      ON CONFLICT (room_name) DO UPDATE SET room_name = EXCLUDED.room_name
      RETURNING room_id
    `;
    try {
      const result = await pool.query(query, [roomName]);
      return result.rows[0].room_id;
    } catch (error) {
      console.error("Error getting or creating room:", error);
      throw error;
    }
  }

  // Helper function to save messages to the database
  async function saveMessage(roomId, userId, message) {
    const query = `
      INSERT INTO message_system.messages (message_id, room_id, user_id, message)
      VALUES (gen_random_uuid(), $1, $2, $3)
    `;
    try {
      await pool.query(query, [roomId, userId, message]);
      console.log(`Saved message in room ${roomId} from user ${userId}`);
    } catch (error) {
      console.error("Error saving message:", error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }

  // Helper function to retrieve messages from the database
  async function getMessages(roomId) {
    const query = `
      SELECT m.message_id, m.message, m.created_at, u.email
      FROM message_system.messages m
      JOIN message_system.users u ON m.user_id = u.user_id
      WHERE m.room_id = $1
      ORDER BY m.created_at ASC
    `;
    try {
      const result = await pool.query(query, [roomId]);
      return result.rows;
    } catch (error) {
      console.error("Error retrieving messages:", error);
      throw error;
    }
  }

  // Socket.io connection handler
  io.on("connection", async (socket) => {
    console.log("New user connected"); // Log when a new user connects

    let userId;
    let roomId;

    // Get the user's email from the client
    socket.on("user email", async (email) => {
      userId = await getOrCreateUser(email);
      socket.userEmail = email;
      console.log(`User ${email} connected`); // Log the connected user's email
    });

    // Handle joining a room
    socket.on("join room", async (roomName) => {
      roomId = await getOrCreateRoom(roomName);
      socket.join(roomId);
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set()); // Create a new Set for the room if it doesn't exist
      }
      rooms.get(roomId).add(socket.id); // Add the socket ID to the room's user set
      console.log(
        `User ${socket.userEmail || "Anonymous"} joined room ${roomName}`
      );
      io.to(roomId).emit("active users", rooms.get(roomId).size); // Emit the number of active users in the room

      // Send previous messages to the user
      const messages = await getMessages(roomId);
      socket.emit("previous messages", messages);
    });

    // Handle leaving a room
    socket.on("leave room", (roomName) => {
      if (roomId && rooms.has(roomId)) {
        socket.leave(roomId);
        rooms.get(roomId).delete(socket.id); // Remove the socket ID from the room's user set
        if (rooms.get(roomId).size === 0) {
          rooms.delete(roomId); // Delete the room if no users are left
        } else {
          io.to(roomId).emit("active users", rooms.get(roomId).size); // Emit the updated number of active users
        }
      }
      console.log(
        `User ${socket.userEmail || "Anonymous"} left room ${roomName}`
      );
    });

    // Handle receiving a chat message
    socket.on("chat message", async ({ room, message }) => {
      if (userId && roomId) {
        await saveMessage(roomId, userId, message);
        const messageObject = {
          text: message,
          email: socket.userEmail || "Anonymous",
          timestamp: new Date(),
        };
        console.log("Emitting chat message:", messageObject);
        io.to(roomId).emit("chat message", messageObject); // Emit the chat message to the room
      }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      if (roomId && rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.id); // Remove the socket ID from the room's user set
        if (rooms.get(roomId).size === 0) {
          rooms.delete(roomId); // Delete the room if no users are left
        } else {
          io.to(roomId).emit("active users", rooms.get(roomId).size); // Emit the updated number of active users
        }
      }
      console.log(`User ${socket.userEmail || "Anonymous"} disconnected`);
    });
  });

  return router; // Return the router
}
