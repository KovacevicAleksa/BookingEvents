import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from "supertest";
import app from "../server.js";
import { setupTestServer, setupTestDatabase, cleanupTest } from './setup/testSetup.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Account from '../models/account.js';
import dotenv from 'dotenv';

dotenv.config();

describe("Account API Tests", () => {
  let server;
  let authToken;
  let testUser;
  let testAccountId;
  let testEmail = process.env.TEST_EMAIL;

  // Setup before all tests
  beforeAll(async () => {
    // Initialize test server
    const serverSetup = await setupTestServer(app);
    server = serverSetup.server;
    
    // Setup test database and get authentication token
    const dbSetup = await setupTestDatabase();
    authToken = dbSetup.authToken;
    testUser = dbSetup.testUser;
    
    // Create a test account for use in specific tests
    const hashedPassword = await bcrypt.hash(process.env.TEST_PASS, 12);
    const testAccount = await Account.create({
      email: process.env.TEST_EMAIL,
      password: hashedPassword,
      events: [],
      isAdmin: true,
      isOrganizer: true,
    });
    testAccountId = testAccount._id.toString();
  });

  // Cleanup after all tests
  afterAll(async () => {
    await Account.deleteMany({ email: `updated@example.com`});
    await Account.deleteMany({ email: `test@example.com`});
    await Account.deleteMany({ email: process.env.TEST_EMAIL});
    await cleanupTest(server, testUser);
  });

  // Tests for GET /accounts endpoint
  describe("GET /accounts", () => {
    it("should return a list of accounts excluding sensitive fields", async () => {
      const response = await request(app)
        .get("/accounts")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      response.body.forEach((account) => {
        expect(account).not.toHaveProperty("password");
        expect(account).not.toHaveProperty("_id");
        expect(account).not.toHaveProperty("events");
      });
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/accounts");
      expect(response.statusCode).toBe(401);
    });
  });

  // Tests for GET /accounts/:id endpoint
  describe("GET /accounts/:id", () => {
    it("should return a single account by ID excluding password", async () => {
      const response = await request(app)
        .get(`/accounts/${testAccountId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("email");
      expect(response.body).not.toHaveProperty("password");
    });

    it("should return 500 for invalid account ID format", async () => {
      const response = await request(app)
        .get("/accounts/invalidid")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(500);
    });
  });

  // Tests for PATCH /edit/account/:id endpoint
  describe("PATCH /edit/account/:id", () => {
    it("should update account details successfully", async () => {
      const updateData = {
        events: ["event123"],
        email: "updated@example.com"
      };

      const response = await request(app)
        .patch(`/edit/account/${testAccountId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.statusCode).toBe(200);
      expect(response.body.email).toBe(updateData.email);
      expect(response.body.events).toContain(updateData.events[0]);
    });

    it("should return 404 for non-existent account", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/edit/account/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ email: "test@test.com" });

      expect(response.statusCode).toBe(404);
    });
  });

  // Tests for PATCH /edit/password/:id endpoint
  describe("PATCH /edit/password/:id", () => {
    it("should update password successfully", async () => {
      const newPassword = `${process.env.TEST_PASS}89312`;
      
      const response = await request(app)
        .patch(`/edit/password/${testAccountId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ password: newPassword });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Password updated successfully");
    });

    it("should reject weak password", async () => {
      const response = await request(app)
        .patch(`/edit/password/${testAccountId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ password: "weak" });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toMatch(/Password must be/);
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await request(app)
        .patch("/edit/password/invalidid")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ password: `${process.env.TEST_PASS}` });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Invalid ID format");
    });
  });

  // Tests for DELETE /remove/account/event/:id endpoint
  describe("DELETE /remove/account/event/:id", () => {
    let eventId = "event123";

    // Reset events array and add test event before each test
    beforeEach(async () => {
      await Account.findByIdAndUpdate(testAccountId, {
        $set: { events: [eventId] }
      });

      const account = await Account.findById(testAccountId);
      expect(account.events).toContain(eventId);
    });

    it("should remove event from account successfully", async () => {
      const response = await request(app)
        .delete(`/remove/account/event/${testAccountId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ EventId: eventId });

      expect(response.statusCode).toBe(200);

      const updatedAccount = await Account.findById(testAccountId);
      expect(updatedAccount.events).not.toContain(eventId);
    });

    it("should handle non-existent event appropriately", async () => {
      await Account.findByIdAndUpdate(testAccountId, {
        $set: { events: [] }
      });

      const response = await request(app)
        .delete(`/remove/account/event/${testAccountId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ EventId: "nonexistentEvent" });

      // API returns 200 even for non-existent events (idempotent operation)
      expect(response.statusCode).toBe(200);

      const account = await Account.findById(testAccountId);
      expect(account.events).toHaveLength(0);
    });
  });
});