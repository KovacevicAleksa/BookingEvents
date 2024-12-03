import express from "express";
import Account from "../models/account.js";
import { auth } from "../middleware/auth.js";
import { resetAccountLimiter } from "../middleware/resetAccountLimiter.js";
import { sendEmail } from "../services/emailService.js";
import mongoose from 'mongoose'; // Added for ObjectId validation
import bcrypt from 'bcrypt'; // Added for password hashing

const router = express.Router();

router.get("/accounts", auth, async (req, res) => {
  try {
    const accounts = await Account.find({}).select("-password -_id -events");
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

    res.status(200).json(account); // Return the account
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

// Route to edit an account by ID
router.patch("/edit/account/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { events, ...otherUpdates } = req.body;

    const update = { $push: { events } }; // Add new events to the account's event list

    if (Object.keys(otherUpdates).length > 0) {
      update.$set = otherUpdates; // Apply other updates to the account
    }

    const updatedAccount = await Account.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }); // Update the account by ID

    if (!updatedAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json(updatedAccount); // Return the updated account
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

//Edit password
router.patch("/edit/password/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    // Enhanced input validation
    if (!id || !password) {
      return res.status(400).json({ 
        message: "All fields are required" 
      });
    }

    // Validate MongoDB ObjectId format to prevent injection
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid ID format"
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long"
      });
    }

    // Regular expression to check password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
      });
    }

    // Generate salt and hash the password manually
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the password directly using updateOne to bypass the pre-save middleware
    const updatedAccount = await Account.updateOne(
      { _id: id },
      { $set: { password: hashedPassword } }
    );

    if (updatedAccount.matchedCount === 0) {
      return res.status(404).json({ 
        message: "Account not found" 
      });
    }

    // Return success without exposing sensitive data
    res.status(200).json({ 
      message: "Password updated successfully",
      timestamp: new Date()
    });

  } catch (error) {
    // Log error safely without exposing sensitive details
    console.error("Password update error:", {
      error: error.message,
      timestamp: new Date()
    });

    res.status(500).json({ 
      message: "An error occurred while updating the password"
    });
  }
});

//Get account ID
router.get("/edit/password/:email", resetAccountLimiter, async (req, res) => {
  try {
    const { email } = req.params;

    const account = await Account.findOne({ email: email });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (!account.id) {
      return res.status(400).json({ message: "Account ID not found" });
    }

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

    res.status(200).json({ message: "Successfully sent ID to email" });
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