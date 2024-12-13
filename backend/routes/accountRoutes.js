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

describe("PATCH /edit/password", () => {
  it("should update password successfully", async () => {
    const newPassword = `${process.env.TEST_PASS}89312`;

    const response = await request(app)
      .patch("/edit/password")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        id: testAccountId,
        email: testEmail,
        password: newPassword,
        code: testVerificationCode,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Password updated successfully");
  });

  it("should reject weak password", async () => {
    const response = await request(app)
      .patch("/edit/password")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        id: testAccountId,
        email: testEmail,
        password: "weak",
        code: testVerificationCode,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch(/Password must be/);
  });

  it("should return 400 for invalid ID format", async () => {
    const response = await request(app)
      .patch("/edit/password")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        id: "invalidid",
        email: testEmail,
        password: `${process.env.TEST_PASS}`,
        code: testVerificationCode,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid ID format");
  });

  it("should return 400 if fields are missing", async () => {
    const response = await request(app)
      .patch("/edit/password")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        id: testAccountId,
        email: testEmail,
        code: testVerificationCode, // Missing password
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("All fields are required");
  });

  it("should return 404 if account is not found", async () => {
    const response = await request(app)
      .patch("/edit/password")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        id: "648a57b1f4f25c1234567890", // Nonexistent ID
        email: testEmail,
        password: `${process.env.TEST_PASS}`,
        code: testVerificationCode,
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Account not found in the database");
  });

  it("should return 404 if verification code is invalid", async () => {
    const response = await request(app)
      .patch("/edit/password")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        id: testAccountId,
        email: testEmail,
        password: `${process.env.TEST_PASS}`,
        code: "wrongcode", // Invalid code
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid verification code");
  });
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