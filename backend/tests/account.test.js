import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from "supertest";
import app from "../server.js";
import { setupTestServer, setupTestDatabase, cleanupTest } from './setup/testSetup.js';

describe("Account API Tests", () => {
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
    }, 30000);
  });

  describe("GET /view/events", () => {
    it("should return a list of events", async () => {
      const response = await request(app)
        .get("/view/events")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    }, 30000);
  });
});