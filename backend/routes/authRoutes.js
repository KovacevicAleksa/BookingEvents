import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Account from "../models/account.js";

const router = express.Router();

// Route to register a new account
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingAccount = await Account.findOne({ email: { $eq: email } });    if (existingAccount) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const account = new Account({
      email,
      password,
      isAdmin: false,
    });
    await account.save(); // Save the new account to the database
    res.status(201).json(account); // Return the newly created account
  } catch (error) {
    res.status(500).json({ message: error.message }); // Return an error if something goes wrong
  }
});

// Route to login and generate a JWT token
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);

    const account = await Account.findOne({ email: { $eq: email } }); // Find the account by email
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

    const token = jwt.sign(
      { id: account._id, email: account.email, isAdmin: account.isAdmin },
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
        events: account.events,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

export default router;
