import mongoose from "mongoose";

// Define the schema for the 'Report' collection
const ReportSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true, // Ensures email is always provided
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    reportText: {
      type: String,
      required: true, // Ensures report text is always provided
      minlength: [10, "Report text must be at least 10 characters long"],
    },
    category: {
      type: String,
      required: true, // Ensures category is always provided
      enum: [
        "Sexual Harassment",
        "False Information",
        "Spam",
        "Hate Speech",
        "Other",
      ],
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Closed"],
      default: "Pending", // Default status is 'Pending'
    },
    reportBy: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    collection: "reports", // Specify the collection name in the database
  }
);

// Ensure virtual fields are not included in JSON or object conversion
ReportSchema.set("toJSON", { virtuals: false });
ReportSchema.set("toObject", { virtuals: false });

// Compile the model from the schema
const Report = mongoose.model("Report", ReportSchema);

export default Report;
