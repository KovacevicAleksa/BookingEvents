const express = require("express");
const router = express.Router();
const Event = require("../models/event");

const { auth } = require("../middleware/auth");

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
    const events = await Event.findById(id); // Find the event by ID
    res.status(200).json(events); // Return the event
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

// Route to edit an event by ID
router.patch("/edit/events/:id", auth, async (req, res) => {
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

module.exports = router;
