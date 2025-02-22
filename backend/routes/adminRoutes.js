import express from "express";
import mongoose from "mongoose";
import Account from "../models/account.js";
import Event from "../models/event.js";
import { adminAuth } from "../middleware/auth.js";
import { body, validationResult } from 'express-validator';

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

// Route to add events (admin only)
router.post(
  "/admin/add/events",
  adminAuth,
  [
    // Validate and sanitize the "title" field
    body("title").trim().escape().notEmpty().withMessage("Title is required."),
    
    // Custom validation for the "price" field
    body("price")
      .custom((value) => {
        // Allow "free" or numeric values only
        if (value === "FREE" || !isNaN(Number(value))) {
          return true;
        }
        throw new Error("Price must be a number or 'FREE'.");
      }),

    // Validate the "date" field to ensure it is a valid ISO8601 date
    body("date").isISO8601().withMessage("Date must be valid."),
    
    // Ensure the "owner" field is an email format
    body("owner").isEmail().withMessage("Owner must be a valid email address.")
  ],
  async (req, res) => {
    // Check if there are validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // Return validation errors
    }

    try {
      const { price, title, description, location, maxPeople, totalPeople, date, owner } = req.body;

      // Check if an event with the same title already exists
      const existingEvent = await Event.findOne({ title: title.trim() });
      if (existingEvent) {
        return res.status(400).json({
          message: `Event with the title "${title}" already exists.`,
        });
      }

      // Create a new event
      const newEvent = new Event({
        price: price === "FREE" ? "FREE" : Number(price), // Save price as "free" or convert it to a number
        title: title.trim(),
        description,
        location,
        maxPeople,
        totalPeople,
        date: new Date(date),
        owner, // Store the owner email
      });

      // Save the new event to the database
      const savedEvent = await newEvent.save();
      console.log("Event saved:", savedEvent);

      // Return the newly created event
      res.status(201).json({ event: savedEvent });
    } catch (error) {
      // Handle server errors
      console.error("Error saving event:", error.message);
      res.status(500).json({ message: "An error occurred while creating the event." });
    }
  }
);

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
// Route to update banDate and automatically increment banCount for a user account (admin only)
router.patch("/admin/update/ban/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { banDate } = req.body;

    // Validate the provided banDate
    if (banDate && isNaN(Date.parse(banDate))) {
      return res.status(400).json({ message: "Invalid banDate format." });
    }

    // Find the account by ID
    const account = await Account.findById(id);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Update banDate if provided
    if (banDate) {
      account.banDate = new Date(banDate); // Update banDate
    }

    // Increment the banCount by 1
    account.banCount += 1;

    // Save the updated account
    const updatedAccount = await account.save();

    res.status(200).json({ message: "Account updated successfully", account: updatedAccount });
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

export default router;
