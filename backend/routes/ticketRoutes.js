import express from "express";
import Ticket from "../models/ticket.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Route to get all tickets
router.get("/tickets", auth, async (req, res) => {
  try {
    const tickets = await Ticket.find({});
    res.status(200).json(tickets); // Return all tickets
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle errors
  }
});

// Route to get a single ticket by ID
router.get("/tickets/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findOne({ _id: id }); // Find ticket by _id, not id

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json(ticket); // Return the ticket
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle errors
  }
});

// Route to create a new ticket
router.post("/tickets", auth, async (req, res) => {
  try {
    const { eventID, assignedTo } = req.body;

    // Check for required fields
    if (!eventID || !assignedTo) {
      return res.status(400).json({ message: "Event ID and Assigned To are required" });
    }

    // Create a new ticket without specifying _id (MongoDB will generate it)
    const newTicket = new Ticket({
      eventID,
      assignedTo,
    });

    await newTicket.save(); // Save the ticket to the database

    res.status(201).json(newTicket); // Return the newly created ticket
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle errors
  }
});


// Route to update a ticket by ID
router.patch("/tickets/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedTicket = await Ticket.findOneAndUpdate({ _id: id }, updates, { // Use _id instead of id
      new: true, // Return the updated document
      runValidators: true, // Ensure updates follow schema rules
    });

    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json(updatedTicket); // Return the updated ticket
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle errors
  }
});

// Route to delete a ticket by ID
import mongoose from "mongoose";

router.delete("/tickets/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(id);
      return res.status(400).json({ message: "Invalid Ticket ID" });
    }

    const deletedTicket = await Ticket.findOneAndDelete({ _id: id });

    if (!deletedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
