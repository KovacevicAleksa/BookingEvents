import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from "supertest";
import app from "../server.js";
import { setupTestServer, setupTestDatabase, cleanupTest } from './setup/testSetup.js';
import mongoose from 'mongoose';
import Ticket from '../models/ticket.js';
import dotenv from 'dotenv';

dotenv.config();

describe("Ticket API Tests", () => {
  let server;
  let authToken;
  let testTicketId;

  // Setup before all tests
  beforeAll(async () => {
    // Initialize test server
    const serverSetup = await setupTestServer(app);
    server = serverSetup.server;

    // Setup test database and get authentication token
    const dbSetup = await setupTestDatabase();
    authToken = dbSetup.authToken;

    // Create a test ticket
    const testTicket = await Ticket.create({
      eventID: "event123",
      assignedTo: "user123",
    });
    testTicketId = testTicket._id.toString();
  });

  // Cleanup after all tests
  afterAll(async () => {
    await Ticket.deleteOne({ "assignedTo": "user456"});
    await cleanupTest(server);
  });

  // Tests for GET /tickets endpoint
  describe("GET /tickets", () => {
    it("should return a list of tickets", async () => {
      const response = await request(app)
        .get("/tickets")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/tickets");
      expect(response.statusCode).toBe(401);
    });
  });

  // Tests for POST /tickets/filter endpoint
  describe("POST /tickets/filter", () => {
    it("should filter tickets by eventID and assignedTo", async () => {
      const response = await request(app)
        .post("/tickets/filter")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ eventID: "event123", assignedTo: "user123" });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty("eventID", "event123");
      expect(response.body[0]).toHaveProperty("assignedTo", "user123");
    });

    it("should return 404 for no matching tickets", async () => {
      const response = await request(app)
        .post("/tickets/filter")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ eventID: "nonexistentEvent" });

      expect(response.statusCode).toBe(404);
    });
  });

  // Tests for GET /tickets/:id endpoint
  describe("GET /tickets/:id", () => {
    it("should return a single ticket by ID", async () => {
      const response = await request(app)
        .get(`/tickets/${testTicketId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("_id", testTicketId);
    });

    it("should return 400 for invalid ticket ID format", async () => {
      const response = await request(app)
        .get("/tickets/invalidid")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(400);
    });
  });

  // Tests for POST /tickets endpoint
  describe("POST /tickets", () => {
    it("should create a new ticket successfully", async () => {
      const newTicket = { eventID: "event456", assignedTo: "user456" };

      const response = await request(app)
        .post("/tickets")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newTicket);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("eventID", newTicket.eventID);
      expect(response.body).toHaveProperty("assignedTo", newTicket.assignedTo);
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(app)
        .post("/tickets")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ eventID: "event456" });

      expect(response.statusCode).toBe(400);
    });
  });

  // Tests for PATCH /tickets/:id endpoint
  describe("PATCH /tickets/:id", () => {
    it("should update a ticket successfully", async () => {
      const updates = { assignedTo: "updatedUser" };

      const response = await request(app)
        .patch(`/tickets/${testTicketId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updates);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("assignedTo", updates.assignedTo);
    });

    it("should return 404 for non-existent ticket", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .patch(`/tickets/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ assignedTo: "nonexistentUser" });

      expect(response.statusCode).toBe(404);
    });
  });

  // Tests for DELETE /tickets/:id endpoint
  describe("DELETE /tickets/:id", () => {
    it("should delete a ticket successfully", async () => {
      const response = await request(app)
        .delete(`/tickets/${testTicketId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("message", "Ticket deleted successfully");
    });

    it("should return 404 for non-existent ticket", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/tickets/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(404);
    });
  });
});
