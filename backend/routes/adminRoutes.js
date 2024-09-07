import express from "express";
import mongoose from "mongoose";
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

// Route to delete a user account by ID
router.delete("/delete/users/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the event exists
    const accountExists = await Account.findById(id);
    if (!accountExists) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Delete the event
    const deletedAccount = await Account.findByIdAndDelete(id);

    if (!deletedAccount) {
      return res.status(500).json({ message: "Failed to delete account" });
    }

    res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Route to delete an event by ID
router.delete("/delete/events/:id", adminAuth, async (req, res) => {
  const session = await mongoose.startSession(); // Start a new session for transaction management
  session.startTransaction(); // Begin a transaction

  try {
    const { id } = req.params; // Extract the event ID from request parameters

    // Attempt to find and delete the event in a single operation
    const deletedEvent = await Event.findByIdAndDelete(id).session(session);

    if (!deletedEvent) {
      // If the event does not exist, abort the transaction and respond with a 404 status
      await session.abortTransaction();
      return res
        .status(404)
        .json({ message: "Event not found or already deleted" });
    }

    // Update all accounts to remove references to the deleted event
    const updateResult = await Account.updateMany(
      { events: id },
      { $pull: { events: id } }
    ).session(session);

    // Commit the transaction after successful deletion and update
    await session.commitTransaction();

    // Respond with a success message and the number of accounts updated
    res.status(200).json({
      message: "Event deleted successfully",
      accountsUpdated: updateResult.modifiedCount,
    });
  } catch (error) {
    // Abort the transaction and log the error if something goes wrong
    await session.abortTransaction();
    console.error("Error deleting event:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  } finally {
    // End the session regardless of transaction success or failure
    session.endSession();
  }
});
export default router;
