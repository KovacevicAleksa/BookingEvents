require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Account = require("../models/account");

describe("GET /accounts", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await new Promise((resolve) => setTimeout(() => resolve(), 500)); //give time to close connection
  });

  it("should return a specific account", async () => {
    const response = await request(app).get("/accounts");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    const testAccount = response.body.find(
      (account) => account.email === process.env.TEST_EMAIL
    );

    expect(testAccount).toBeDefined();
    expect(testAccount).toHaveProperty("email", process.env.TEST_EMAIL);
    expect(testAccount).toHaveProperty("password");
    expect(testAccount).toHaveProperty("_id");
    expect(testAccount).toHaveProperty("events");
    expect(Array.isArray(testAccount.events)).toBe(true);
  });
});
