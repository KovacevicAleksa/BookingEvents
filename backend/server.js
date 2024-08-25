// Load environment variables from .env file
require("dotenv").config({ path: __dirname + "/.env" });

// Import dependencies
const mongoose = require("mongoose"); // Mongoose for MongoDB interaction
const express = require("express"); // Express framework for creating the server
const cors = require("cors"); // CORS middleware to allow cross-origin requests
const bcrypt = require("bcrypt"); // bcrypt for hashing passwords
const path = require("path"); // Path module for handling file paths
const rateLimit = require("express-rate-limit"); // Rate limiting middleware
const helmet = require("helmet"); // Helmet middleware for setting various HTTP headers to enhance security
const nodeLimits = require("limits"); // Limits middleware to control file upload and request sizes
const bodyParser = require("body-parser"); // Body parser for parsing incoming request bodies
const jwt = require("jsonwebtoken"); // JSON Web Token for handling authentication

// Import models
const Account = require("./models/account"); // Importing Account model
const Event = require("./models/event"); // Importing Event model

// Import middleware
const { auth, adminAuth } = require("./middleware/auth");

// Import routes
const authRoutes = require("./routes/authRoutes");
const accountRoutes = require("./routes/accountRoutes");
const eventRoutes = require("./routes/eventRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Initializing the Express application
const app = express();

// Set the server port from environment variable or default to 8080
const port = process.env.PORT || 8080;

// MongoDB connection URI from environment variables
const dbURI = process.env.MONGODB_URI;

// Trust the first proxy, useful when the app is behind a proxy like Nginx
app.set("trust proxy", 1);

// Disable the 'X-Powered-By' header for security reasons
app.disable("x-powered-by");

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
  origin: "http://localhost:3000", // Allow only requests from your frontend
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // Allow cookies to be sent with requests
  optionsSuccessStatus: 200, // For legacy browser support
};

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

// Connect to MongoDB and start the server
mongoose
  .connect(dbURI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`); // Log the server port
      console.log("Connected to the database successfully"); // Log successful database connection
      console.log(`Server start time: ${new Date().toLocaleString()}`); // Log the server start time
    });
  })
  .catch((err) => console.log(`Database connection error: ${err}`)); // Log any database connection errors

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0); // Exit the process once the server and database connection are closed
    });
  });
});

// Export the Express app for use in other files
module.exports = app;
