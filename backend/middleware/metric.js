import prometheus from "prom-client";
import express from "express";

// Create a Registry
const register = new prometheus.Registry();

// Add default metrics
prometheus.collectDefaultMetrics({
  app: "express-api",
  prefix: "node_",
  timeout: 10000,
  register,
});

// Custom metrics
const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 0.5, 1, 5],
});

const httpRequestsTotal = new prometheus.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "code"],
});

// MongoDB specific metrics
const mongoDbConnections = new prometheus.Gauge({
  name: "mongodb_connections_total",
  help: "Number of current MongoDB connections",
});

const mongoDbOperations = new prometheus.Counter({
  name: "mongodb_operations_total",
  help: "Number of MongoDB operations",
  labelNames: ["operation", "collection"],
});

// Socket.IO metrics
const socketConnections = new prometheus.Gauge({
  name: "socketio_connections_total",
  help: "Number of current Socket.IO connections",
});

const socketEvents = new prometheus.Counter({
  name: "socketio_events_total",
  help: "Number of Socket.IO events",
  labelNames: ["event"],
});

// Register all metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(mongoDbConnections);
register.registerMetric(mongoDbOperations);
register.registerMetric(socketConnections);
register.registerMetric(socketEvents);

// Metrics middleware
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    // Record HTTP metrics
    httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration / 1000);

    httpRequestsTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .inc();
  });

  next();
};

// Socket.IO monitoring
export const monitorSocketIO = (io) => {
  io.on("connection", (socket) => {
    socketConnections.inc();

    socket.on("disconnect", () => {
      socketConnections.dec();
    });

    // Monitor all events
    socket.onAny((eventName) => {
      socketEvents.labels(eventName).inc();
    });
  });
};

// MongoDB monitoring
export const monitorMongoDB = (mongoose) => {
  mongoose.connection.on("connected", () => {
    mongoDbConnections.inc();
  });

  mongoose.connection.on("disconnected", () => {
    mongoDbConnections.dec();
  });

  // Monitor MongoDB operations
  mongoose.connection.on("open", () => {
    const db = mongoose.connection.db;

    ["find", "insert", "update", "delete"].forEach((operation) => {
      db.on(`${operation}`, (collection) => {
        mongoDbOperations.labels(operation, collection).inc();
      });
    });
  });
};

// Metrics endpoint
const metricsRouter = express.Router();
metricsRouter.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

export { metricsMiddleware as default, metricsRouter };
