import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import app from "../server.js";
import { setupTestServer, setupTestDatabase, cleanupTest } from './setup/testSetup.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Account from '../models/account.js';
import Verification from '../models/verification.js';
import dotenv from 'dotenv';
import request from "supertest";

dotenv.config();

describe("Account API Tests", () => {
  let server;
  let authToken;
  let testUser;
  let testAccountId;
  let testEmail = process.env.TEST_EMAIL;
  let testVerificationCode;

  // Setup test environment before running tests
  beforeAll(async () => {
    // Initialize test server
    const serverSetup = await setupTestServer(app);
    server = serverSetup.server;
    
    // Setup test database
    const dbSetup = await setupTestDatabase();
    authToken = dbSetup.authToken;
    testUser = dbSetup.testUser;
    
    // Create test account
    const hashedPassword = await bcrypt.hash(process.env.TEST_PASS, 12);
    const testAccount = await Account.create({
      email: process.env.TEST_EMAIL,
      password: hashedPassword,
      events: [],
      isAdmin: true,
      isOrganizer: true,
    });
    testAccountId = testAccount._id.toString();

    // Create verification code
    const verificationDoc = await Verification.create({
      email: testEmail,
      code: '123456',
      expireAt: new Date(Date.now() + 15 * 60 * 1000)
    });
    testVerificationCode = verificationDoc.code;
  });

  // Cleanup after all tests
  afterAll(async () => {
    await Account.deleteMany({ email: `updated@example.com`});
    await Account.deleteMany({ email: `test@example.com`});
    await Account.deleteMany({ email: process.env.TEST_EMAIL});
    await Verification.deleteMany({ email: testEmail });
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

  // Tests for GET /edit/password/:email endpoint
  describe("GET /edit/password/:email", () => {
    it("should send verification code for existing email", async () => {
      const response = await request(app)
        .get(`/edit/password/${testEmail}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toContain(`Successfully sent ID to ${testEmail}`);
    });

    it("should return 404 for non-existent email", async () => {
      const response = await request(app)
        .get("/edit/password/nonexistent@example.com")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(404);
    });
  });

  // Tests for PATCH /edit/password endpoint
  describe("PATCH /edit/password", () => {
    it("should update password successfully", async () => {
      // Request verification code
      const verificationResponse = await request(app)
        .get(`/edit/password/${testEmail}`)
        .set("Authorization", `Bearer ${authToken}`);
    
      // Fetch generated verification code
      const verification = await Verification.findOne({ email: testEmail });
      const generatedCode = verification.code;
    
      const newPassword = `${process.env.TEST_PASS}89312`;
    
      const response = await request(app)
        .patch("/edit/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          id: testAccountId,
          email: testEmail,
          password: newPassword,
          code: generatedCode, // Use dynamically generated code
        });
    
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Password updated successfully");
    });

    it("should reject weak password", async () => {
      const response = await request(app)
        .patch("/edit/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          id: testAccountId,
          email: testEmail,
          password: "weak",
          code: testVerificationCode,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toMatch(/Password must be/);
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await request(app)
        .patch("/edit/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          id: "invalidid",
          email: testEmail,
          password: `${process.env.TEST_PASS}`,
          code: testVerificationCode,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Invalid ID format");
    });

    it("should return 400 if fields are missing", async () => {
      const response = await request(app)
        .patch("/edit/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          id: testAccountId,
          email: testEmail,
          code: testVerificationCode, // Missing password
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("All fields are required");
    });

    it("should return 404 if account is not found", async () => {
      const response = await request(app)
        .patch("/edit/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          id: "648a57b1f4f25c1234567890", // Non-existent ID
          email: testEmail,
          password: `${process.env.TEST_PASS}`,
          code: testVerificationCode,
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Account not found in the database");
    });

    it("should return 400 if verification code is invalid", async () => {
      const response = await request(app)
        .patch("/edit/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          id: testAccountId,
          email: testEmail,
          password: `${process.env.TEST_PASS}`,
          code: "wrongcode", // Invalid code
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Invalid verification code");
    });
  });

  // Tests for DELETE /remove/account/event/:id endpoint
  describe("DELETE /remove/account/event/:id", () => {
    let eventId = "event123";

    // Reset events array before each test
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