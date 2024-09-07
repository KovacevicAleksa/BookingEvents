import express from "express";
import Account from "../models/account.js";
import Event from "../models/event.js";
import { adminAuth } from "../middleware/auth.js";

const router = express.Router();

// Route to get all accounts (admin users have full access)
router.get("/admin/accounts", adminAuth, async (req, res) => {
  try {
    const accounts = await Account.find({});
    res.status(200).json(accounts); // Return the list of accounts
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

// Route to add a new event (admin only)
router.post("/admin/add/events", adminAuth, async (req, res) => {
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

export default router;
