import express from "express";
import Ticket from "../models/ticket.js";
import { adminAuth, auth } from "../middleware/auth.js";
import mongoose from 'mongoose';


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

// Route to search tickets by eventID and/or assignedTo using request body
router.post("/tickets/filter", auth, async (req, res) => {
  try {
    const { eventID, assignedTo } = req.body; // Extract values from request body

    const filter = {}; // Initialize an empty filter object

    if (eventID) {
      filter.eventID = eventID; // Add eventID to the filter if provided
    }

    if (assignedTo) {
      filter.assignedTo = assignedTo; // Add assignedTo to the filter if provided
    }

    // Find tickets based on the filter
    const tickets = await Ticket.find(filter);

    if (tickets.length === 0) {
      return res.status(404).json({ message: "No tickets found with the given criteria" });
    }

    res.status(200).json(tickets); // Return matching tickets
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle errors
  }
});


// Route to get a single ticket by ID
router.get("/tickets/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Ticket ID" });
    }

    const ticket = await Ticket.findOne({ _id: id });

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
router.patch("/tickets/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    if (req.body.assignedTo && typeof req.body.assignedTo === 'string') {
      updates.assignedTo = req.body.assignedTo;
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(id);
      return res.status(400).json({ message: "Invalid Ticket ID" });
    }

    // Validate the request body (updates)
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Request body is required and cannot be empty" });
    }

    // Allowed fields for update
    const allowedUpdates = ["assignedTo"];
    const invalidFields = Object.keys(updates).filter(
      (key) => !allowedUpdates.includes(key)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `Invalid fields in request body: ${invalidFields.join(", ")}`,
      });
    }

    // Perform the update using Mongoose
    const updatedTicket = await Ticket.findOneAndUpdate(
      { _id: { $eq: id } }, // Use $eq to ensure id is treated as a literal value
      updates,
      {
        new: true, // Return the updated document
        runValidators: true, // Ensure updates follow schema rules
      }
    );

    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json(updatedTicket); // Return the updated ticket
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to delete a ticket by ID
router.delete("/tickets/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(id);
      return res.status(400).json({ message: "Invalid Ticket ID" });
    }

    // Delete the ticket by ID
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
