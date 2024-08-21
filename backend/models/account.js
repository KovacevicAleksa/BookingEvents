const mongoose = require("mongoose"); // Import the Mongoose library for interacting with MongoDB
const bcrypt = require("bcrypt"); // Import the bcrypt library for hashing passwords

// Define the schema for the 'Account' collection
const AccountSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true, // Add index on the events field
    },
    password: {
      type: String,
      required: true,
    },
    events: {
      type: [String],
      index: true, // Add index on the events field
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically add 'createdAt' and 'updatedAt' timestamps
    collection: "accounts", // Specifies the collection name in MongoDB
  }
);

// Middleware function to hash the password before saving the document
AccountSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      // Check if the password field has been modified
      return next(); // If not modified, continue to the next middleware
    }
    const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
    this.password = await bcrypt.hash(this.password, salt); // Hash the password with the generated salt
    next(); // Proceed to the next middleware or save the document
  } catch (error) {
    next(error); // Pass any errors to the next middleware or error handler
  }
});

// Create and export the 'Account' model based on the schema
const Account = mongoose.model("Account", AccountSchema);

module.exports = Account;
