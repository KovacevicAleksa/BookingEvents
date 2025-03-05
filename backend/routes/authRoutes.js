import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Account from "../models/account.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Route to register a new account
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
    const { email, password } = req.body;
    const existingAccount = await Account.findOne({ email: { $eq: email } });
    if (existingAccount) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const account = new Account({
      email,
      password,
      isAdmin: false,
      isOrganizer: false,
    });
    await account.save(); // Save the new account to the database
    res.status(201).json(account); // Return the newly created account
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

// Route to login and generate a JWT token
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      console.log(`Login attempt for email: ${email}`);

      const account = await Account.findOne({ email: { $eq: String(email) } }); // Find the account by email
      if (!account) {
        console.log(`No account found for email: ${email}`);
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, account.password); // Compare the password with the hashed password
      if (!isMatch) {
        console.log(`Invalid password for email: ${email}`);
        return res.status(400).json({ message: "Invalid email or password" });
      }

      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables");
        return res.status(500).json({ message: "Internal server error" });
      }

      // Check if the account is banned
      if (account.banCount >= 1) {
        const currentDate = new Date();
        const banDuration = account.banDate - currentDate;

        if (banDuration > 0) {
          const secondsLeft = Math.floor(banDuration / 1000);
          const minutesLeft = Math.floor(secondsLeft / 60);
          const hoursLeft = Math.floor(minutesLeft / 60);
          const daysLeft = Math.floor(hoursLeft / 24);

          console.error(`Account is banned for ${daysLeft} days, ${hoursLeft % 24} hours, ${minutesLeft % 60} minutes.`);
          return res.status(403).json({
            message: `Account is banned for ${daysLeft} days, ${hoursLeft % 24} hours, ${minutesLeft % 60} minutes.`,
          });
        }
      }

      // If the account is not banned, proceed to create JWT token
      const token = jwt.sign(
        { id: account._id, email: account.email, isAdmin: account.isAdmin, isOrganizer: account.isOrganizer },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      console.log(`Login successful for email: ${email}`);
      res.status(200).json({
        message: "Login successful",
        token,
        account: {
          id: account._id,
          email: account.email,
          isAdmin: account.isAdmin,
          isOrganizer: account.isOrganizer,
          events: account.events,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

export default router;
