import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from "supertest";
import app from "../server.js";
import { setupTestServer, setupTestDatabase, cleanupTest } from './setup/testSetup.js';

describe("Event API Tests", () => {
  let server;
  let authToken;
  let testUser;

  beforeAll(async () => {
    const serverSetup = await setupTestServer(app);
    server = serverSetup.server;
    
    const dbSetup = await setupTestDatabase();
    authToken = dbSetup.authToken;
    testUser = dbSetup.testUser;
  });

  afterAll(async () => {
    await cleanupTest(server, testUser);
  });

  describe("GET /view/events", () => {
    it("should return a list of events including a specific event", async () => {
      const response = await request(app)
        .get("/view/events")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    }, 30000);
  });
});