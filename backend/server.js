require("dotenv").config(); // Load environment variables from .env file
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

const Account = require("./models/account"); // Importing Account model
const Event = require("./models/event"); // Importing Event model

const app = express(); // Initializing the Express application

const port = process.env.PORT || 8080; // Set the server port from environment variable or default to 8080

// Trust the first proxy, useful when the app is behind a proxy like Nginx
app.set("trust proxy", 1);

// Disable the 'X-Powered-By' header for security reasons
app.disable("x-powered-by");

// Middleware to block access to cloud metadata services (often used in cloud environments)
app.use((req, res, next) => {
  const metadataUrl = "http://169.254.169.254";
  if (req.url.startsWith(metadataUrl)) {
    return res.status(403).send("Access to metadata is forbidden");
  }
  next();
});

const dbURI = process.env.MONGODB_URI; // MongoDB connection URI from environment variables

app.use(cors()); // Enable CORS for all requests
app.use(
  helmet({
    // Set various security headers with Helmet
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

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // Middleware to parse URL-encoded request bodies

// General rate limiter for all incoming requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, // Include rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

app.use(
  nodeLimits({
    // Set limits on file uploads and request sizes
    file_uploads: false, // Disable file uploads
    post_max_size: 2000000, // Limit request size to 2MB
    inc_req_timeout: 60000, // 60-second timeout for incoming requests
  })
);

app.use(
  bodyParser.json({ limit: "1mb" }) // Limit JSON request body size to 1MB
);

app.use(limiter); // Apply rate limiting middleware

// Middleware for admin authentication
const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization"); // Get the Authorization header
    if (!authHeader) {
      return res
        .status(401)
        .send({ error: "No Authorization header provided." });
    }

    const token = authHeader.replace("Bearer ", ""); // Extract the token from the header
    if (!token) {
      return res.status(401).send({ error: "No token provided." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
      const account = await Account.findById(decoded.id); // Find the account associated with the token

      if (!account) {
        return res.status(404).send({ error: "Account not found." });
      }

      if (!account.isAdmin) {
        return res.status(403).send({ error: "User is not an admin." });
      }

      req.account = account; // Attach the account to the request object
      req.token = token; // Attach the token to the request object
      next(); // Move to the next middleware or route handler
    } catch (err) {
      console.error("Error verifying token:", err);
      return res.status(401).send({ error: "Invalid token." });
    }
  } catch (error) {
    console.error("adminAuth error:", error);
    res.status(500).send({ error: "Server error during authentication." });
  }
};

// Middleware for general user authentication
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization"); // Get the Authorization header
    if (!authHeader) {
      return res
        .status(401)
        .send({ error: "No Authorization header provided." });
    }

    const token = authHeader.replace("Bearer ", ""); // Extract the token from the header
    if (!token) {
      return res.status(401).send({ error: "No token provided." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
      const account = await Account.findById(decoded.id); // Find the account associated with the token

      if (!account) {
        return res.status(404).send({ error: "Account not found." });
      }

      req.account = account; // Attach the account to the request object
      req.token = token; // Attach the token to the request object
      next(); // Move to the next middleware or route handler
    } catch (err) {
      console.error("Error verifying token:", err);
      return res.status(401).send({ error: "Invalid token." });
    }
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).send({ error: "Server error during authentication." });
  }
};

// Route to register a new account
app.post("/register", async (req, res) => {
  try {
    const { email, password, isAdmin } = req.body;
    const existingAccount = await Account.findOne({ email });
    if (existingAccount) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const account = new Account({
      email,
      password,
      isAdmin: isAdmin || false,
    });
    await account.save(); // Save the new account to the database
    res.status(201).json(account); // Return the newly created account
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

// Route to login and generate a JWT token
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);

    const account = await Account.findOne({ email }); // Find the account by email
    if (!account) {
      console.log(`No account found for email: ${email}`);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, account.password); // Compare the password with the hashed password
    if (!isMatch) {
      console.log(`Invalid password for email: ${email}`);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ message: "Internal server error" });
    }

    const token = jwt.sign(
      { id: account._id, email: account.email, isAdmin: account.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log(`Login successful for email: ${email}`);
    res.status(200).json({
      message: "Login successful",
      token,
      account: {
        id: account._id,
        email: account.email,
        isAdmin: account.isAdmin,
        events: account.events,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Route to get all accounts (non-admin users only see non-sensitive information)
app.get("/accounts", auth, async (req, res) => {
  try {
    const accounts = await Account.find({}).select("-password -_id -events");
    res.status(200).json(accounts); // Return the list of accounts
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

// Route to get all accounts (admin users have full access)
app.get("/admin/accounts", adminAuth, async (req, res) => {
  try {
    const accounts = await Account.find({});
    res.status(200).json(accounts); // Return the list of accounts
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

// Route to get a single account by ID
app.get("/accounts/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findById(id).select("-password"); // Find the account by ID and exclude the password

    res.status(200).json(account); // Return the account
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

// Route to add a new event (admin only)
app.post("/admin/add/events", adminAuth, async (req, res) => {
  try {
    const {
      price,
      title,
      description,
      location,
      maxPeople,
      totalPeople,
      date,
    } = req.body;

    const newEvent = new Event({
      price,
      title,
      description,
      location,
      maxPeople,
      totalPeople,
      date: new Date(date),
    });

    const savedEvent = await newEvent.save(); // Save the new event to the database
    console.log("Event saved:", savedEvent);

    res.status(201).json({ event: savedEvent }); // Return the newly created event
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

// Route to view all events
app.get("/view/events", auth, async (req, res) => {
  try {
    const events = await Event.find({});
    res.status(200).json(events); // Return the list of events
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

// Route to view a specific event by ID
app.get("/view/events/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const events = await Event.findById(id); // Find the event by ID
    res.status(200).json(events); // Return the event
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

// Route to edit an event by ID
app.patch("/edit/events/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedEvent = await Event.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }); // Update the event by ID with the provided data

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(updatedEvent); // Return the updated event
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

// Route to edit an account by ID
app.patch("/edit/account/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { events, ...otherUpdates } = req.body;

    const update = { $push: { events } }; // Add new events to the account's event list

    if (Object.keys(otherUpdates).length > 0) {
      update.$set = otherUpdates; // Apply other updates to the account
    }

    const updatedAccount = await Account.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }); // Update the account by ID

    if (!updatedAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json(updatedAccount); // Return the updated account
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

// Route to remove an event from an account
app.delete("/remove/account/event/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const eventIdToDelete = req.body.EventId;

    const updatedEvent = await Account.findOneAndUpdate(
      { _id: id },
      { $pull: { events: eventIdToDelete } }
    ); // Remove the event from the account's event list

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(updatedEvent); // Return the updated account after event removal
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

// Connect to MongoDB and start the server
mongoose
  .connect(dbURI) // Connect to the MongoDB database
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

module.exports = app; // Export the Express app for use in other files
