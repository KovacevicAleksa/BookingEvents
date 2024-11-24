import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from "supertest";
import app from "../server.js";
import { setupTestServer, setupTestDatabase, cleanupTest } from './setup/testSetup.js';
import mongoose from 'mongoose';
import Event from '../models/event.js';

describe("Event API Tests", () => {
  let server;
  let authToken;
  let testUser;
  let testEventId;

  // Initialize test environment before running tests
  beforeAll(async () => {
    // Set up test server and get instance
    const serverSetup = await setupTestServer(app);
    server = serverSetup.server;
    
    // Set up test database and get authentication credentials
    const dbSetup = await setupTestDatabase();
    authToken = dbSetup.authToken;
    testUser = dbSetup.testUser;
    
    // Create a sample event for testing
    const testEvent = await Event.create({
      title: "Test Event",
      description: "This is a test event description",
      location: "Test Location",
      date: new Date(),
      maxPeople: 100,
      totalPeople: 10,
      price: "50",
    });
    testEventId = testEvent._id.toString();
  });

  // Clean up test data after all tests complete
  afterAll(async () => {
    await Event.deleteMany({});
    await cleanupTest(server, testUser);
  });

  // Test suite for GET /view/events endpoint
  describe("GET /view/events", () => {
    // Test successful retrieval of events list
    it("should return a list of events", async () => {
      const response = await request(app)
        .get("/view/events")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    // Test authentication requirement
    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/view/events");
      expect(response.statusCode).toBe(401);
    });
  });

  // Test suite for GET /view/events/:id endpoint
  describe("GET /view/events/:id", () => {
    // Test successful retrieval of single event
    it("should return a single event by ID", async () => {
      const response = await request(app)
        .get(`/view/events/${testEventId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("title", "Test Event");
    });

    // Test handling of non-existent event
    it("should return 404 for non-existent event ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/view/events/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(404);
    });
  });

  // Test suite for PATCH /edit/events/:id endpoint
  describe("PATCH /edit/events/:id", () => {
    // Test successful event update
    it("should update event details successfully", async () => {
      const updateData = {
        title: "Updated Event Title",
        location: "Updated Location"
      };

      const response = await request(app)
        .patch(`/edit/events/${testEventId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.statusCode).toBe(200);
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.location).toBe(updateData.location);
    });

    // Test handling of updates to non-existent event
    it("should return 404 for non-existent event", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/edit/events/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Non-existent Event" });

      expect(response.statusCode).toBe(404);
    });
  });
});