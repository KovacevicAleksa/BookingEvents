import express from "express";
import Event from "../models/event.js";
import pkg from "pg";
import dotenv from "dotenv";
import { redis, healthCheck } from '../config/redis.js'; // Added Redis import

dotenv.config();

const { Pool } = pkg;
const router = express.Router();

const pool = new Pool({
  host: process.env.PG_HOST || "postgres",
  user: process.env.PG_USER,
  password: process.env.PG_PASS,
  database: process.env.PG_DB,
  port: 5432,
});

// Added new route for Redis health check
router.get("/healthcheck/redis", async (req, res) => {
  try {
    // Using the ping command to check Redis connection
    const startTime = Date.now();
    await redis.ping();
    const latency = Date.now() - startTime;
    
    res.status(200).json({ 
      status: "OK", 
      message: "Redis connection is healthy",
      latency: `${latency}ms` // Return Redis ping latency in milliseconds
    });
  } catch (error) {
    console.error("Redis health check failed:", error);
    res.status(500).json({ 
      status: "ERROR", 
      message: "Redis connection failed",
      error: error.message 
    });
  }
});

// Updated main health check route to include Redis
router.get("/health", async (req, res) => {
  try {
    // Check PostgreSQL connection
    await pool.query("SELECT 1");
    
    // Check MongoDB connection
    const events = await Event.find({});
    
    // Check Redis connection and get latency
    const redisStartTime = Date.now();
    await redis.ping();
    const redisLatency = Date.now() - redisStartTime;

    res.status(200).json({ 
      status: "OK", 
      message: "All service connections are healthy",
      services: {
        postgresql: "healthy",
        mongodb: "healthy",
        redis: {
          status: "healthy",
          latency: `${redisLatency}ms`
        }
      }
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({ 
      status: "unhealthy", 
      error: error.message,
      services: {
        postgresql: await checkPostgres(),
        mongodb: await checkMongo(),
        redis: await checkRedis()
      }
    });
  }
});

// Helper functions to check individual services
async function checkPostgres() {
  try {
    await pool.query("SELECT 1");
    return "healthy";
  } catch (error) {
    return "unhealthy";
  }
}

async function checkMongo() {
  try {
    await Event.find({});
    return "healthy";
  } catch (error) {
    return "unhealthy";
  }
}

async function checkRedis() {
  try {
    const startTime = Date.now();
    await redis.ping();
    const latency = Date.now() - startTime;
    return {
      status: "healthy",
      latency: `${latency}ms`
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message
    };
  }
}

router.get("/healthcheck/pg", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "OK", message: "Database connection is healthy" });
  } catch (error) {
    console.error("Database health check failed:", error);
    res.status(500).json({ status: "ERROR", message: "Database connection failed" });
  }
});

export default router;