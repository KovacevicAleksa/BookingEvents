import dotenv from "dotenv";
dotenv.config(); // Load environment variables from a .env file
import request from "supertest"; // Import supertest for making HTTP requests in tests
import mongoose from "mongoose";
import app from "../server";
import Account from "../models/account.js"; // Import the Account model
import jwt from "jsonwebtoken"; // Import jsonwebtoken for generating JWTs

describe("API Endpoints", () => {
  let authToken; // Variable to store the authentication token

  beforeAll(async () => {
    // Hook that runs before all tests
    await mongoose.connection.close(); // Close existing MongoDB connections
    await mongoose.connect(process.env.MONGODB_URI); // Connect to MongoDB using the URI from environment variables

    // Create a test user and generate a token
    const testUser = new Account({
      email: "testuser@example.com", // Test user email
      password: "testpassword", // Test user password
    });
    await testUser.save(); // Save the test user to the database

    authToken = jwt.sign(
      { id: testUser._id, email: testUser.email }, // Payload for the JWT
      process.env.JWT_SECRET, // Secret key for signing the JWT
      { expiresIn: "1h" } // Token expiration time
    );
  });

  afterAll(async () => {
    await Account.deleteOne({ email: "testuser@example.com" }); // Delete the test user from the database
    await mongoose.connection.close();
  });

  describe("GET /view/events", () => {
    it("should return a list of events including a specific event", async () => {
      const response = await request(app)
        .get("/view/events") // Make a GET request to the /view/events endpoint
        .set("Authorization", `Bearer ${authToken}`); // Set the Authorization header with the token

      expect(response.statusCode).toBe(200); // Expect the response status code to be 200
      expect(Array.isArray(response.body)).toBe(true); // Expect the response body to be an array
    });
  });

  describe("GET /accounts", () => {
    it("should return a specific account", async () => {
      const response = await request(app)
        .get("/accounts") // Make a GET request to the /accounts endpoint
        .set("Authorization", `Bearer ${authToken}`); // Set the Authorization header with the token

      expect(response.statusCode).toBe(200); // Expect the response status code to be 200
      expect(Array.isArray(response.body)).toBe(true); // Expect the response body to be an array
    });
  });
});
