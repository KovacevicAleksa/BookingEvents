import express from "express";
import Event from "../models/event.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Route to view all events
router.get("/view/events", auth, async (req, res) => {
  try {
    const events = await Event.find({});

    res.status(200).json(events); // Return the list of events
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

// Route to view a specific event by ID
router.get("/view/events/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id); // Find the event by ID
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event); // Return the event
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

// Route to edit an event by ID
router.patch("/edit/events/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Basic input validation
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    // Sanitize update fields - only allow specific fields to be updated
    const allowedFields = ['title', 'description', 'date', 'location','totalPeople','maxPeople']; // add your allowed fields
    const sanitizedUpdate = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        // Basic sanitization - remove special characters
        if (typeof updateData[key] === 'string') {
          sanitizedUpdate[key] = updateData[key].replace(/[<>{}]/g, '');
        } else {
          sanitizedUpdate[key] = updateData[key];
        }
      }
    });

    const updatedEvent = await Event.findByIdAndUpdate(id, { $set: sanitizedUpdate }, {
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

export default router;
