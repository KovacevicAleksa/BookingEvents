// routes/accountRoutes.js

const express = require("express");
const router = express.Router();
const Account = require("../models/account");
const { auth } = require("../middleware/auth");

router.get("/accounts", auth, async (req, res) => {
  try {
    const accounts = await Account.find({}).select("-password -_id -events");
    res.status(200).json(accounts); // Return the list of accounts
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

router.get("/accounts/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findById(id).select("-password"); // Find the account by ID and exclude the password

    res.status(200).json(account); // Return the account
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

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