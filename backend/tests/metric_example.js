import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { MongoMemoryServer } from "mongodb-memory-server";
import express from "express";
import { io as Client } from "socket.io-client";

async function testMetrics() {
  // Create test Express app
  const app = express();
  const server = http.createServer(app);

  // Initialize Socket.IO
  const io = new Server(server);

  // Import your metrics middleware
  const metricsMiddleware = (await import("../middleware/metric.js")).default;
  const { metricsRouter, monitorSocketIO, monitorMongoDB } = await import(
    "../middleware/metric.js"
  );

  // Apply metrics middleware and router
  app.use(metricsMiddleware);
  app.use(metricsRouter);

  // Set up test route to generate some HTTP metrics
  app.get("/test", (req, res) => {
    res.send("Test route");
  });

  // Start server
  const port = 3333;
  server.listen(port);

  // Set up MongoDB Memory Server for testing
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to test database
  await mongoose.connect(mongoUri);
  monitorMongoDB(mongoose);

  // Set up Socket.IO monitoring
  monitorSocketIO(io);

  console.log("Starting metrics test...\n");

  // Generate some test data
  try {
    // Test HTTP metrics
    console.log("Testing HTTP metrics...");
    for (let i = 0; i < 5; i++) {
      await fetch(`http://localhost:${port}/test`);
    }

    // Test Socket.IO metrics
    console.log("Testing Socket.IO metrics...");
    const socket = Client(`http://localhost:${port}`);
    socket.emit("test-event");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    socket.disconnect();

    // Test MongoDB metrics
    console.log("Testing MongoDB metrics...");
    const TestModel = mongoose.model(
      "Test",
      new mongoose.Schema({ name: String })
    );
    await TestModel.create({ name: "test" });
    await TestModel.find();
    await TestModel.updateOne({ name: "test" }, { name: "updated" });
    await TestModel.deleteOne({ name: "updated" });

    // Fetch and display metrics
    console.log("\nFetching metrics...");
    const metricsResponse = await fetch(`http://localhost:${port}/metrics`);
    const metricsText = await metricsResponse.text();
    console.log("\nMetrics output:");
    console.log(metricsText);
  } catch (error) {
    console.error("Error during test:", error);
  } finally {
    // Cleanup
    await mongoose.disconnect();
    await mongoServer.stop();
    server.close();
    console.log("\nTest completed and cleaned up");
  }
}

// Run the test
testMetrics();
