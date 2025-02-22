import mongoose from "mongoose"; // Import the Mongoose library for interacting with MongoDB
import bcrypt from "bcrypt"; // Import the bcrypt library for hashing passwords

// Define the schema for the 'Account' collection
const AccountSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true, // Indexed for faster email-based queries
    },
    password: {
      type: String,
      required: true,
    },
    events: {
      type: [String],
      index: true, // Indexed for faster event-based queries
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isOrganizer: {
      type: Boolean,
      default: false,
    },
    banDate: {
      type: Date,
      default: null,
    },
    banCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    collection: "accounts",
  }
);

// Hash password before saving
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

// Method to compare passwords
AccountSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Account = mongoose.model("Account", AccountSchema);

export default Account;