import express from "express";
import Account from "../models/account.js";
import { auth, adminAuth  } from "../middleware/auth.js";
import { resetAccountLimiter } from "../middleware/resetAccountLimiter.js";
import { sendEmail } from "../services/emailService.js";
import mongoose from 'mongoose'; // Added for ObjectId validation
import bcrypt from 'bcrypt'; // Added for password hashing
import Verification from "../models/verification.js"

const router = express.Router();

router.get("/accounts", auth, async (req, res) => {
  try {
    const accounts = await Account.find({}).select("-password -_id -events");

    if (!accounts.length) {
      return res.status(404).json({ message: "No accounts found." });
    }

    res.status(200).json(accounts); // Return the list of accounts
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

// Route to get a single account by ID
router.get("/accounts/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findById(id).select("-password"); // Find the account by ID and exclude the password

    if (!account) {
      return res.status(404).json({ message: "Account not found." });
    }

    if (!id) {
      return res.status(404).json({ message: "Id not found." });
    }

    res.status(200).json(account); // Return the account
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

router.patch("/edit/account/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { events, ...otherUpdates } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid account ID format" });
    }

    // Validate events if provided
    if (events) {
      if (!Array.isArray(events)) {
        return res.status(400).json({ message: "Events must be an array" });
      }
    }

    // Build update object
    const update = {};
    if (events) {
      update.$push = { events: { $each: events } }; // Add multiple events
    }
    if (Object.keys(otherUpdates).length > 0) {
      update.$set = otherUpdates; // Add other updates
    }

    // Find and update account
    const updatedAccount = await Account.findByIdAndUpdate(id, update, {
      new: true, // Return updated document
      runValidators: true, // Apply model validation
    });

    if (!updatedAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json(updatedAccount); // Return the updated account
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({
      message: "An error occurred while updating the account. Please try again later.",
    });
  }
});

//Edit password
router.patch("/edit/password", resetAccountLimiter, async (req, res) => {
  try {
    const { id, email, password, code } = req.body;

    // Validate MongoDB ObjectId early
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Enhanced input validation
    if (!id || !email || !password || !code) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email.length > 256 || !emailRegex.test(email) || typeof email !== "string") {
        return res.status(400).json({ message: "Invalid email format" });
    }

    const account = await Account.findOne({ _id: id });
    if (!account) {
      return res.status(404).json({ message: "Account not found in the database" });
    }

    const verification = await Verification.findOne({ email: { $eq: email } });
    if (!verification) {
      return res.status(404).json({ message: "Verification not found or expired" });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }

    // Verification code check
    if (verification.code.trim() !== code.trim()) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update account password
    const updatedAccount = await Account.findByIdAndUpdate(
      id,
      { $set: { password: hashedPassword } },
      { new: true }
    );

    if (!updatedAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json({
      message: "Password updated successfully",
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Password update error:", error.message, error.stack);

    res.status(500).json({
      message: "Something went wrong. Please try again later.",
      timestamp: new Date(),
    });
  }
});

//Get account ID
router.get("/edit/password/:email", resetAccountLimiter, async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const account = await Account.findOne({ email });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code

    // Create or update the verification document
    await Verification.findOneAndUpdate(
      { email },
      { code, expireAt: new Date(Date.now() + 15 * 60 * 1000) },
      { upsert: true } // Create if not exists
    );


    await sendEmail(
      account.email,
      "Reset Your Password",
      `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
              <h2 style="text-align: center; color: #333;">Reset Your Password</h2>
              <p>Dear User,</p>
              <p>We received a request to reset the password for your account associated with this email address.</p>
              <p>If you requested this password reset, please click the link below to reset your password:</p>
              <p>ID: ${account.id}</p>
              <p>Your verification code is: <strong>${code}</strong></p><p>This code will expire in 15 minutes.</p>
              <p>http://localhost/change-password/${account.id}</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="http://localhost/change-password/${account.id}"
                  style="background-color: #28a745; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
              <p>Thank you,</p>
              <p>BookingEvent</p>
            </div>
          </body>
        </html>
      `
    );

    console.log("Account ID sent to email");

    res.status(200).json({ message: `Successfully sent ID to ${email}` });
  } catch (error) {
    console.error("Error in /edit/password/:email route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to remove an event from an account
router.delete("/remove/account/event/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const eventIdToDelete = req.body.EventId;

    const updatedEvent = await Account.findOneAndUpdate(
      { _id: id },
      { $pull: { events: eventIdToDelete } }
    ); // Remove the event from the account's event list

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(updatedEvent); // Return the updated account after event removal
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

export default router;