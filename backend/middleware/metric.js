import prometheus from "prom-client";
import express from "express";
import os from "os";
import pkg from '@kubernetes/client-node';
const { Kubernetes, KubeConfig } = pkg;

const register = new prometheus.Registry();

const metrics = {
  // Process metrics
  processHeapBytes: new prometheus.Gauge({
    name: "process_heap_bytes", // Standardized metric name
    help: "Process heap size in bytes",
    labelNames: ["type"],
    collect() {
      const memUsage = process.memoryUsage();
      this.set({ type: "used" }, memUsage.heapUsed);
      this.set({ type: "total" }, memUsage.heapTotal);
    },
  }),

  processMemory: new prometheus.Gauge({
    name: "process_memory_bytes", // Standardized metric name
    help: "Process memory usage in bytes",
    labelNames: ["type"],
    collect() {
      const memUsage = process.memoryUsage();
      this.set({ type: "rss" }, memUsage.rss);
      this.set({ type: "external" }, memUsage.external);
    },
  }),

  // System metrics
  nodeMemory: new prometheus.Gauge({
    name: "node_memory_bytes", // Standardized metric name
    help: "Node memory usage in bytes",
    labelNames: ["type"],
    collect() {
      this.set({ type: "total" }, os.totalmem());
      this.set({ type: "free" }, os.freemem());
      this.set({ type: "used" }, os.totalmem() - os.freemem());
    },
  }),

  nodeCPUUsage: new prometheus.Gauge({
    name: "node_cpu_usage_percent", // Standardized metric name
    help: "Node CPU usage percentage",
    collect() {
      const startUsage = process.cpuUsage();
      const startTime = process.hrtime();

      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const endTime = process.hrtime(startTime);

        const elapsedTime = endTime[0] + endTime[1] / 1e9;
        const cpuPercent =
          (endUsage.user + endUsage.system) /
          (elapsedTime * 1e6) /
          os.cpus().length;

        this.set(cpuPercent);
      }, 1000);
    },
  }),

  // HTTP metrics
  httpRequestDuration: new prometheus.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  }),

  httpRequestsTotal: new prometheus.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"],
  }),

  // Error metrics
  errorsTotal: new prometheus.Counter({
    name: "node_errors_total", // Standardized metric name
    help: "Total number of application errors",
    labelNames: ["type"],
  }),
};

// Register default metrics with standardized prefix
prometheus.collectDefaultMetrics({
  register,
  prefix: "node_",
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// Register all custom metrics
Object.values(metrics).forEach((metric) => register.registerMetric(metric));

// Enhanced metrics middleware
const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime();

  metrics.httpRequestsTotal.inc({
    method: req.method,
    route: req.route?.path || req.path,
    status_code: 0,
  });

  res.on("finish", () => {
    const duration = process.hrtime(start);
    const durationSeconds = duration[0] + duration[1] / 1e9;
    const route = req.route?.path || req.path;

    metrics.httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: res.statusCode,
      },
      durationSeconds
    );

    metrics.httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
    });
  });

  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Increment error counter with error type
  metrics.errorsTotal.inc({
    type: err.name || "unknown_error",
  });

  // Log error for debugging
  console.error(`Error occurred: ${err.message}`);

  // Send error response
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal server error",
      type: err.name || "UnknownError",
      status: err.status || 500,
    },
  });
};

// MongoDB monitoring function
const monitorMongoDB = (mongoose) => {
  mongoose.connection.on("connected", () => {
    console.log("MongoDB Connected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB Error:", err);
    metrics.errorsTotal.inc({ type: "mongodb_error" });
  });

  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB Disconnected");
  });
};

// Socket.IO monitoring function
const monitorSocketIO = (io) => {
  io.on("connection", (socket) => {
    console.log("New socket connection");

    socket.on("error", (error) => {
      console.error("Socket.IO Error:", error);
      metrics.errorsTotal.inc({ type: "socketio_error" });
    });
  });
};

// Metrics endpoint
const metricsRouter = express.Router();
metricsRouter.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export {
  metrics,
  register,
  metricsMiddleware,
  monitorMongoDB,
  monitorSocketIO,
  errorHandler,
  metricsRouter,
};
