// Load environment variables from .env file
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: __dirname + "/.env" });

// Import dependencies
import mongoose from "mongoose"; // Mongoose for MongoDB interaction
import express from "express"; // Express framework for creating the server
import cors from "cors"; // CORS middleware to allow cross-origin requests
import rateLimit from "express-rate-limit"; // Rate limiting middleware
import helmet from "helmet"; // Helmet middleware for setting various HTTP headers to enhance security
import nodeLimits from "limits"; // Limits middleware to control file upload and request sizes
import bodyParser from "body-parser"; // Body parser for parsing incoming request bodies

//import for chatRoutes
import http from "http";
import { Server } from "socket.io";
import chatRoutes from "./routes/chatRoutes.js";

//import middleware
import {
  metrics,
  register,
  metricsMiddleware,
  monitorMongoDB,
  monitorSocketIO,
  errorHandler,
  metricsRouter,
} from "./middleware/metric.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import healthCheckRoutes from "./routes/healthCheckRoutes.js";

// Initializing the Express application
const app = express();

// Create HTTP server using the Express app
const httpServer = http.createServer(app);

// Set the server port from environment variable or default to 8080
const port = process.env.PORT || 8080;

// MongoDB connection URI from environment variables
const dbURI = process.env.MONGODB_URI;

// Trust the first proxy, useful when the app is behind a proxy like Nginx
app.set("trust proxy", 1);

// Disable the 'X-Powered-By' header for security reasons
app.disable("x-powered-by");

// Apply metrics middleware
app.use(metricsMiddleware);

// Add metrics endpoint
app.use(metricsRouter);

// Middleware to block access to cloud metadata services
app.use((req, res, next) => {
  const metadataIp = "169.254.169.254";
  const metadataUrl = `http://${metadataIp}`;

  if (
    req.url.startsWith(metadataUrl) ||
    req.headers.host === metadataIp ||
    req.headers["x-forwarded-host"] === metadataIp
  ) {
    return res.status(403).send("Access to metadata is forbidden");
  }
  next();
});

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost", // Allow only requests from your frontend
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // Allow cookies to be sent with requests
  optionsSuccessStatus: 200, // For legacy browser support
};

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost", // Replace with your React app's URL
    methods: ["GET", "POST"],
    credentials: true, // Allow credentials to be included in Socket.IO requests
  },
});

app.use(cors(corsOptions));

// Set various security headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// Middleware to parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// General rate limiter for all incoming requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, // Include rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Set limits on file uploads and request sizes
app.use(
  nodeLimits({
    file_uploads: false, // Disable file uploads
    post_max_size: 2000000, // Limit request size to 2MB
    inc_req_timeout: 60000, // 60-second timeout for incoming requests
  })
);

// Limit JSON request body size to 1MB
app.use(bodyParser.json({ limit: "1mb" }));

// Apply rate limiting middleware
app.use(limiter);

// Apply routes
app.use("/", authRoutes); //POST /registration, /login
app.use("/", accountRoutes); //GET /accounts, /accounts/:id, PATCH /edit/account/:id, PATCH /edit/password/:id, DELETE /remove/account/event/:id
app.use("/", eventRoutes); //GET /events, POST /create/event, PATCH /edit/event/:id, DELETE /remove/event/:id
app.use("/", adminRoutes); //Admin routes (protected by adminAuth middleware)
app.use("/", healthCheckRoutes); //Health check routes

// New chat route using the initialized Socket.IO instance
app.use("/api/chat", chatRoutes(io));

app.use(errorHandler);

// Connect to MongoDB and start the server
process.env.NODE_ENV !== 'test' && 
mongoose
  .connect(dbURI)
  .then(() => {
    // Monitor MongoDB status (e.g., health, queries)
    monitorMongoDB(mongoose);

    // Start the HTTP server once the database connection is successful
    httpServer.listen(port, () => {
      // Monitor Socket.IO connections
      monitorSocketIO(io);

      // Log information about server and database connection
      console.log(`Server is running on port ${port}`); // Log the server port
      console.log("Successfully connected to the MongoDB"); // Log successful database connection
      console.log(`Server start time: ${new Date().toLocaleString()}`); // Log the server start time
    });
  })
  .catch((err) => {
    // Log any database connection errors
    console.error(`Database connection error: ${err}`);
  });

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");

  // Close the HTTP server first
  httpServer.close(() => {
    console.log("HTTP server closed");

    // Close the MongoDB connection
    mongoose.connection
      .close()
      .then(() => {
        console.log("Mongoose connection closed."); // Log successful closure of MongoDB connection
        process.exit(0); // Exit the process with a success code
      })
      .catch((err) => {
        console.error("Error closing the Mongoose connection:", err); // Log any errors during closure
        process.exit(1); // Exit the process with a failure code
      });
  });
});


// Export the Express app for use in other files
export default app;
