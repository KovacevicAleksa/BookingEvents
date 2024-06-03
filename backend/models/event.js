const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      auto: true,
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
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
  { collection: "events" }
);

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;
