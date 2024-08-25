// routes/accountRoutes.js

const express = require("express");
const router = express.Router();
const Account = require("../models/account");
const { auth } = require("../middleware/auth");
const { sendEmail } = require("../services/emailService"); // Import email service

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

router.patch("/edit/password/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const account = await Account.findById(id);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    account.password = password;
    await account.save();

    await sendEmail(
      account.email,
      "Password was changed",
      "Your password has been successfully changed."
    );

    console.log("Password change notification email sent.");

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/edit/password/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const account = await Account.findOne({ email: email });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (!account.id) {
      return res.status(400).json({ message: "Account ID not found" });
    }

    await sendEmail(account.email, "Account ID", `Account ID: ${account.id}`);

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

module.exports = router;
