require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");
const Account = require("./models/account");
const Event = require("./models/event");

const app = express();

const dbURI = process.env.MONGODB_URI;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingAccount = await Account.findOne({ email });
    if (existingAccount) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const account = new Account({ email, password });
    await account.save();
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const account = await Account.findOne({ email });
    if (!account) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.status(200).json({ message: "Login successful", account });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/accounts", async (req, res) => {
  try {
    const accounts = await Account.find({});
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/accounts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findById(id);
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/admin/add/events", async (req, res) => {
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

    // Create and save the new event
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

app.get("/view/events", async (req, res) => {
  try {
    const events = await Event.find({});
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
mongoose
  .connect(dbURI)
  .then(() => {
    app.listen(8080, () => {
      console.log("Listening");
    });
    console.log("connected to db");
  })
  .catch((err) => console.log(err));
