require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const nodeLimits = require("limits");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const Account = require("./models/account");
const Event = require("./models/event");

const app = express();

const port = process.env.PORT || 8080;

// Trust first proxy
app.set("trust proxy", 1);

app.disable("x-powered-by");

// Middleware for blocking cloud metadata service
app.use((req, res, next) => {
  const metadataUrl = "http://169.254.169.254";
  if (req.url.startsWith(metadataUrl)) {
    return res.status(403).send("Access to metadata is forbidden");
  }
  next();
});

const dbURI = process.env.MONGODB_URI;

app.use(cors());
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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up a general rate limiter for all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(
  nodeLimits({
    file_uploads: false,
    post_max_size: 2000000, // Limit request sizes to 2MB
    inc_req_timeout: 60000, // Set a timeout of 60 seconds
  })
);

app.use(
  bodyParser.json({
    limit: "1mb", // Limiting JSON body size to 1MB
  })
);

app.use(limiter);

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res
        .status(401)
        .send({ error: "No Authorization header provided." });
    }
    //need to add JWT
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return res.status(401).send({ error: "No token provided." });
    }

    let account;
    try {
      account = await Account.findById(token);
    } catch (err) {
      console.error("Error finding account:", err);
      return res.status(400).send({ error: "Invalid token format." });
    }

    if (!account) {
      return res.status(404).send({ error: "Account not found." });
    }

    if (!account.isAdmin) {
      return res.status(403).send({ error: "User is not an admin." });
    }

    req.account = account;
    next();
  } catch (error) {
    console.error("adminAuth error:", error);
    res.status(500).send({ error: "Server error during authentication." });
  }
};

//REgistrovanje
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
    await account.save();
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);

    const account = await Account.findOne({ email });
    if (!account) {
      console.log(`No account found for email: ${email}`);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      console.log(`Invalid password for email: ${email}`);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Make sure the secret key is correctly loaded from environment variables
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

//Dobijanje svih naloga
app.get("/accounts", async (req, res) => {
  try {
    const accounts = await Account.find({}).select("-password -_id -events");
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Dobijanje svih naloga admin
app.get("/admin/accounts", adminAuth, async (req, res) => {
  try {
    const accounts = await Account.find({});
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Dobijanje jednog naloga preko id
app.get("/accounts/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findById(id);
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Dodavanje eventa novih
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

    // Kreiranje i cuvanje novog elementa
    const newEvent = new Event({
      price,
      title,
      description,
      location,
      maxPeople,
      totalPeople,
      date: new Date(date),
    });

    const savedEvent = await newEvent.save();
    console.log("Event saved:", savedEvent);

    res.status(201).json({ event: savedEvent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//view events
app.get("/view/events", async (req, res) => {
  try {
    const events = await Event.find({});
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//view event preko id
app.get("/view/events/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const events = await Event.findById(id);
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// edit event preko id
app.patch("/edit/events/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Pretrazivanje eventa preko id i njegov update
    const updatedEvent = await Event.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit account with ID
app.patch("/edit/account/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { events, ...otherUpdates } = req.body;

    const update = { $push: { events } };

    if (Object.keys(otherUpdates).length > 0) {
      update.$set = otherUpdates;
    }

    const updatedAccount = await Account.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!updatedAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json(updatedAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/remove/account/event/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params; // Get account ID from URL parameter
    const eventIdToDelete = req.body.EventId; // Assuming EventId is the property name in the request body

    const updatedEvent = await Account.findOneAndUpdate(
      { _id: id }, // Match the account document
      { $pull: { events: eventIdToDelete } } // Remove the event ID from the 'events' array
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

mongoose
  .connect(dbURI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log("Connected to the database successfully");
      console.log(`Server start time: ${new Date().toLocaleString()}`);
    });
  })
  .catch((err) => console.log(`Database connection error: ${err}`));

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });
});

module.exports = app;
