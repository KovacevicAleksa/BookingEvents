require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Account = require("../models/account");
const jwt = require("jsonwebtoken");

describe("API Endpoints", () => {
  let authToken;

  beforeAll(async () => {
    await mongoose.connection.close();
    await mongoose.connect(process.env.MONGODB_URI);

    // Create a test user and generate a token
    const testUser = new Account({
      email: "testuser@example.com",
      password: "testpassword",
    });
    await testUser.save();

    authToken = jwt.sign(
      { id: testUser._id, email: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  afterAll(async () => {
    await Account.deleteOne({ email: "testuser@example.com" });
    await mongoose.connection.close();
  });

  describe("GET /view/events", () => {
    it("should return a list of events including a specific event", async () => {
      const response = await request(app)
        .get("/view/events")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      // Rest of your test...
    });
  });

  describe("GET /accounts", () => {
    it("should return a specific account", async () => {
      const response = await request(app)
        .get("/accounts")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      // Rest of your test...
    });
  });
});
