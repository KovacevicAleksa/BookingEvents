import express from "express";
import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg; // Destructuring Pool from pg package

const router = express.Router();

const pool = new Pool({
  host: process.env.PG_HOST || "postgres",
  user: process.env.PG_USER,
  password: process.env.PG_PASS,
  database: process.env.PG_DB,
  port: 5432,
});

router.get("/health", async (req, res) => {
  res.status(200).json({ status: "healthy" });
});

router.get("/healthcheck/pg", async (req, res) => {
  try {
    await pool.query("SELECT 1"); // Simple query to check database connection
    res
      .status(200)
      .json({ status: "OK", message: "Database connection is healthy" });
  } catch (error) {
    console.error("Database health check failed:", error);
    res
      .status(500)
      .json({ status: "ERROR", message: "Database connection failed" });
  }
});

export default router;
