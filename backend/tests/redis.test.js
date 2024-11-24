import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from "supertest";
import app from "../server.js";
import { setupTestServer, setupTestDatabase, cleanupTest } from './setup/testSetup.js';
import mongoose from 'mongoose';
import Event from '../models/event.js';
import { redis } from '../config/redis.js';

describe("Redis Cache Tests", () => {
  let server;
  let authToken;
  let testUser;
  let testEventId;

  // Silence console logs during tests
  beforeAll(async () => {
    // Suppress console logs during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const serverSetup = await setupTestServer(app);
    server = serverSetup.server;
    await redis.flushall();
    
    const dbSetup = await setupTestDatabase();
    authToken = dbSetup.authToken;
    testUser = dbSetup.testUser;
    
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

    // Pre-cache the test event
    await redis.set(
      `event:${testEventId}`,
      JSON.stringify(testEvent),
      'EX',
      3600
    );
  });

  afterAll(async () => {
    // Restore console functions
    jest.restoreAllMocks();
    
    await Event.deleteMany({});
    await redis.flushall();
    await redis.quit();
    await cleanupTest(server, testUser);
  });

  describe("Redis Caching", () => {
    it("should cache event data after first fetch", async () => {
      // Clear cache before test
      await redis.del(`event:${testEventId}`);
      
      const firstResponse = await request(app)
        .get(`/view/events/${testEventId}`)
        .set("Authorization", `Bearer ${authToken}`);
      
      expect(firstResponse.statusCode).toBe(200);

      const cachedData = await redis.get(`event:${testEventId}`);
      expect(cachedData).toBeTruthy();
      
      const parsedCache = JSON.parse(cachedData);
      expect(parsedCache).toHaveProperty('title', firstResponse.body.title);
    });

    it("should return cached data on subsequent requests", async () => {
      // Ensure data is in cache
      const eventData = await Event.findById(testEventId);
      await redis.set(
        `event:${testEventId}`,
        JSON.stringify(eventData),
        'EX',
        3600
      );

      const start = Date.now();
      const response = await request(app)
        .get(`/view/events/${testEventId}`)
        .set("Authorization", `Bearer ${authToken}`);
      const end = Date.now();

      expect(response.statusCode).toBe(200);
      expect(end - start).toBeLessThan(200);
    });

    it("should handle cache miss gracefully", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      // Clear any existing cache for this ID
      await redis.del(`event:${fakeId}`);

      const response = await request(app)
        .get(`/view/events/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(404);
      
      const cachedData = await redis.get(`event:${fakeId}`);
      expect(cachedData).toBeNull();
    });
  });

  describe("Redis Health Check", () => {
    it("should return true when Redis is connected", async () => {
      const { healthCheck } = await import('../config/redis.js');
      
      // Ensure Redis is connected before test
      await redis.ping();
      
      const isHealthy = await healthCheck();
      expect(isHealthy).toBe(true);
    });
  
    it("should handle connection errors gracefully", async () => {
      const { healthCheck } = await import('../config/redis.js');
      
      // Store original ping function
      const originalPing = redis.ping.bind(redis);
      
      // Mock ping to simulate connection failure
      redis.ping = jest.fn().mockRejectedValueOnce(new Error('Connection refused'));
      
      const isHealthy = await healthCheck();
      expect(isHealthy).toBe(false);
      
      // Restore original ping function
      redis.ping = originalPing;
    });
  });

  describe("Redis Error Handling", () => {
    it("should fallback to database when Redis throws error", async () => {
      // Store original get function
      const originalGet = redis.get.bind(redis);
      
      // Mock get to simulate Redis error
      redis.get = jest.fn().mockRejectedValueOnce(new Error('Redis error'));
  
      const response = await request(app)
        .get(`/view/events/${testEventId}`)
        .set("Authorization", `Bearer ${authToken}`);
  
      expect(response.statusCode).toBe(200);
      
      // Restore original get function
      redis.get = originalGet;
    });
  });
});
