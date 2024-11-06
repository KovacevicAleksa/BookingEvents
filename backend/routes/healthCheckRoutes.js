import express from "express";
import Event from "../models/event.js";
import pkg from "pg";
import dotenv from "dotenv";

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


router.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    const events = await Event.find({});

    res.status(200).json({ status: "OK", message: "PostgreSQL and MongoDB connection is healthy" });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({ status: "unhealthy", error: error.message });
  }
});

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
