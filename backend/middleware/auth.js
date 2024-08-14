const jwt = require("jsonwebtoken");
const Account = require("../models/account");

// Middleware for general user authentication
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization"); // Get the Authorization header
    if (!authHeader) {
      return res
        .status(401)
        .send({ error: "No Authorization header provided." });
    }

    const token = authHeader.replace("Bearer ", ""); // Extract the token from the header
    if (!token) {
      return res.status(401).send({ error: "No token provided." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
      const account = await Account.findById(decoded.id); // Find the account associated with the token

      if (!account) {
        return res.status(404).send({ error: "Account not found." });
      }

      req.account = account; // Attach the account to the request object
      req.token = token; // Attach the token to the request object
      next(); // Move to the next middleware or route handler
    } catch (err) {
      console.error("Error verifying token:", err);
      return res.status(401).send({ error: "Invalid token." });
    }
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).send({ error: "Server error during authentication." });
  }
};

// Middleware for admin authentication
const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization"); // Get the Authorization header
    if (!authHeader) {
      return res
        .status(401)
        .send({ error: "No Authorization header provided." });
    }

    const token = authHeader.replace("Bearer ", ""); // Extract the token from the header
    if (!token) {
      return res.status(401).send({ error: "No token provided." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
      const account = await Account.findById(decoded.id); // Find the account associated with the token

      if (!account) {
        return res.status(404).send({ error: "Account not found." });
      }

      if (!account.isAdmin) {
        return res.status(403).send({ error: "User is not an admin." });
      }

      req.account = account; // Attach the account to the request object
      req.token = token; // Attach the token to the request object
      next(); // Move to the next middleware or route handler
    } catch (err) {
      console.error("Error verifying token:", err);
      return res.status(401).send({ error: "Invalid token." });
    }
  } catch (error) {
    console.error("adminAuth error:", error);
    res.status(500).send({ error: "Server error during authentication." });
  }
};

module.exports = { auth, adminAuth };
