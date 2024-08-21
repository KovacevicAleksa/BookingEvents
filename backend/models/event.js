const mongoose = require("mongoose");

// Define the schema for the 'Event' collection
const EventSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId, // The type of the id field is ObjectId
      required: true,
      auto: true, // Automatically generate a unique ObjectId for this field (not typically needed if _id is used)
    },
    price: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    maxPeople: {
      type: Number,
      required: true,
    },
    totalPeople: {
      type: Number,
      required: true,
      index: true, // Add index on the totalPeople field
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add 'createdAt' and 'updatedAt' timestamps
  },
  { collection: "events" } // Specifies the collection name in MongoDB
);

// Create and export the 'Event' model based on the schema
const Event = mongoose.model("Event", EventSchema);

module.exports = Event;
