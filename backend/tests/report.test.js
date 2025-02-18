import { jest, describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app from "../server.js";
import mongoose from "mongoose";
import Report from "../models/report.js";
import Account from "../models/account.js";
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import { setupTestServer, setupTestDatabase, cleanupTest } from "./setup/testSetup.js";

dotenv.config();

describe("Report API Tests", () => {
  let server;
  let regularToken;
  let adminToken;
  let testReportId;
  let testUser;

  beforeAll(async () => {
    server = (await setupTestServer(app)).server;
    const dbSetup = await setupTestDatabase();
    testUser = dbSetup.testUser;
    
    // Create a regular user without admin privileges
    const regularUser = await Account.create({
      email: "regular@test.com",
      password: "testpass123",
      isAdmin: false
    });

    // Create separate tokens for regular and admin users
    regularToken = jwt.sign(
      { id: regularUser._id, email: regularUser.email, isAdmin: false },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    adminToken = jwt.sign(
      { id: testUser._id, email: testUser.email, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Create a test report in the database
    const testReport = await Report.create({
      email: "testuser@example.com",
      reportText: "This is a test report with enough characters.",
      category: "Spam",
      reportBy: "testuser@example.com",
    });
    testReportId = testReport._id.toString();
  });

  afterAll(async () => {
    await Account.deleteMany({ email: "regular@test.com" });
    await Report.deleteMany({ email: "validuser@example.com" });
    await Report.deleteMany({ email: "testuser@example.com" });
    await cleanupTest(server);
  });

  // *** GET /report (Admin only) ***
  describe("GET /report", () => {
    it("should return a list of reports (admin only)", async () => {
      const response = await request(app)
        .get("/report")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return 403 if not an admin", async () => {
      const response = await request(app)
        .get("/report")
        .set("Authorization", `Bearer ${regularToken}`);

      expect(response.statusCode).toBe(403);
    });
  });

  // *** POST /report ***
  describe("POST /report", () => {
    it("should create a new report successfully", async () => {
      const newReport = {
        email: "validuser@example.com",
        reportText: "A detailed and valid report text.",
        category: "Hate Speech",
        reportBy: "reportBy@gmail.com",
      };

      const response = await request(app)
        .post("/report")
        .set("Authorization", `Bearer ${regularToken}`) // Regular users can create reports
        .send(newReport);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("newReport");
      expect(response.body.newReport).toHaveProperty("category", "Hate Speech");
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(app)
        .post("/report")
        .set("Authorization", `Bearer ${regularToken}`)
        .send({ email: "user@example.com", reportText: "" });

      expect(response.statusCode).toBe(400);
    });

    it("should return 500 for an invalid category", async () => {
      const response = await request(app)
        .post("/report")
        .set("Authorization", `Bearer ${regularToken}`)
        .send({ email: "user@example.com", reportText: "Valid text", category: "InvalidCategory",reportBy: "reportBy@gmail.com"});

      expect(response.statusCode).toBe(500);
    });
  });

  // *** DELETE /report/:id (Admin only) ***
  describe("DELETE /report/:id", () => {
    it("should delete a report successfully (admin only)", async () => {
      const response = await request(app)
        .delete(`/report/${testReportId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("message", "Report deleted successfully");
    });

    it("should return 404 for non-existent report", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/report/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(404);
    });

    it("should return 400 for invalid report ID", async () => {
      const response = await request(app)
        .delete("/report/invalidid")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(400);
    });

    it("should return 403 if not an admin", async () => {
      const response = await request(app)
        .delete(`/report/${testReportId}`)
        .set("Authorization", `Bearer ${regularToken}`);

      expect(response.statusCode).toBe(403);
    });
  });
});