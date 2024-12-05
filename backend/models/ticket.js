import mongoose from "mongoose";

// Define the schema for the 'Ticket' collection
const TicketSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "tickets", // Specify the collection name
  }
);

// Ensure virtual fields are not included in JSON or object conversion
TicketSchema.set("toJSON", { virtuals: false });
TicketSchema.set("toObject", { virtuals: false });

const Ticket = mongoose.model("Ticket", TicketSchema);

export default Ticket;
