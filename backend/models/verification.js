import mongoose from "mongoose";

const VerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /[^@\s]+@[^@\s]+\.[^@\s]+/,
  },
  code: {
    type: String,
    required: true,
  },
  expireAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 minutes TTL
    index: { expireAfterSeconds: 0 },
  },
});

const Verification = mongoose.model("verification", VerificationSchema);

export default Verification;
