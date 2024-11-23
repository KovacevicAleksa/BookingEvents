import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import dotenv from "dotenv";
import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import Account from "../models/account.js";
import jwt from "jsonwebtoken";

dotenv.config();

describe("API Tests", () => {
  let authToken; // Authentication token
  let server; // Server instance
  let testUserId; // ID of the test user

  beforeAll(async () => {
    try {
      // Close any existing connections
      await mongoose.connection.close();

      // Connect to the MongoDB database
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      // Create a test user
      const testUser = new Account({
        email: "testuser@example.com",
        password: "testpassword", // Consider hashing if your schema uses hooks
      });
      const savedUser = await testUser.save();
      testUserId = savedUser._id;

      // Generate an authentication token for the test user
      authToken = jwt.sign(
        { id: testUserId, email: testUser.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Start the server on a dynamic port
      server = app.listen(0);
    } catch (error) {
      console.error("Setup failed:", error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      // Remove the test user
      await Account.deleteOne({ _id: testUserId });

      // Close the database connection
      await mongoose.connection.close();

      // Stop the server
      await server.close();
    } catch (error) {
      console.error("Cleanup failed:", error);
      throw error;
    }
  });

  describe("GET /accounts", () => {
    it("should return a list of accounts excluding sensitive fields", async () => {
      const response = await request(app)
        .get("/accounts")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200); // Expect a successful response
      expect(Array.isArray(response.body)).toBe(true); // Ensure the response is an array
      response.body.forEach((account) => {
        expect(account).not.toHaveProperty("password"); // Ensure passwords are excluded
        expect(account).not.toHaveProperty("_id"); // Ensure _id is excluded
        expect(account).not.toHaveProperty("events"); // Ensure events are excluded
      });
    }, 30000);
  });

  describe("GET /view/events", () => {
    it("should return a list of events", async () => {
      const response = await request(app)
        .get("/view/events")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200); // Expect a successful response
      expect(Array.isArray(response.body)).toBe(true); // Ensure the response is an array
    }, 30000);
  });
});
