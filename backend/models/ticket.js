import mongoose from "mongoose";

// Define the schema for the 'Ticket' collection
const TicketSchema = new mongoose.Schema(
  {
    // MongoDB will automatically generate a valid ObjectId for _id
    eventID: {
      type: String,
      required: true, // Ensures the eventID is always provided
    },
    assignedTo: {
      type: String,
      required: true, // Ensures the assignedTo field is always provided
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    collection: "tickets", // Specify the collection name in the database
  }
);

// Ensure virtual fields are not included in JSON or object conversion
TicketSchema.set("toJSON", { virtuals: false });
TicketSchema.set("toObject", { virtuals: false });

// Compile the model from the schema
const Ticket = mongoose.model("Ticket", TicketSchema);

export default Ticket;
