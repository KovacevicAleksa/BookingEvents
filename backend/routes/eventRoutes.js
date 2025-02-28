import express from "express";
import Event from "../models/event.js";
import { auth, adminAuth } from "../middleware/auth.js";
import { getOrSetCache, redis } from '../config/redis.js';
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Route to view all events with Redis caching
router.get("/view/events", auth, async (req, res) => {
  try {
    console.time('events-fetch'); // Measure execution time
    
    const events = await getOrSetCache('events', async () => {
      console.log('Cache MISS - Fetching from Database');
      const events = await Event.find({});
      return events;
    });
    
    console.timeEnd('events-fetch'); // Display total time
    console.log(`Total events fetched: ${events.length}`);

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: error.message });
  }
});
// Route to view a specific event by ID with Redis caching
router.get("/view/events/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const event = await getOrSetCache(`event:${id}`, async () => {
      const event = await Event.findById(id);
      if (!event) {
        throw new Error('Event not found');
      }
      return event;
    });

    res.status(200).json(event);
  } catch (error) {
    if (error.message === 'Event not found') {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(500).json({ message: error.message });
  }
});

// Route to edit an event by ID - includes cache invalidation
router.patch("/edit/events/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    const allowedFields = ['title', 'description', 'date', 'location', 'totalPeople', 'maxPeople', 'owner'];
    const sanitizedUpdate = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
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
    
    if (typeof redis !== 'undefined' && redis && !process.env.DISABLE_REDIS) {
      await redis.del(`event:${id}`);
      await redis.del('events');
    }
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;