import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import dotenv from "dotenv";
import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import Account from "../models/account.js";
import jwt from "jsonwebtoken";

dotenv.config();

describe("API Endpoints", () => {
  let authToken;
  let server;

  beforeAll(async () => {
    try {
      // Close any existing connections
      await mongoose.connection.close();
      
      // Connect to MongoDB
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      // Create test user
      const testUser = new Account({
        email: "testuser@example.com",
        password: "testpassword",
      });
      await testUser.save();

      // Generate auth token
      authToken = jwt.sign(
        { id: testUser._id, email: testUser.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Start server on a different port for testing
      server = app.listen(0);
    } catch (error) {
      console.error('Setup failed:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await Account.deleteOne({ email: "testuser@example.com" });
      await mongoose.connection.close();
      await server.close();
    } catch (error) {
      console.error('Cleanup failed:', error);
      throw error;
    }
  });

  describe("GET /view/events", () => {
    it("should return a list of events including a specific event", async () => {
      try {
        const response = await request(app)
          .get("/view/events")
          .set("Authorization", `Bearer ${authToken}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      } catch (error) {
        console.error('Test failed:', error);
        throw error;
      }
    }, 30000);
  });
});