import jwt from "jsonwebtoken";
import Account from "../models/account.js";

/**
 * Extracts and validates the JWT token from the Authorization header
 * @param {Object} req - Express request object
 * @returns {Object} Object containing the validation result and token
 */
const validateAuthHeader = (req) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    throw new Error("No Authorization header provided");
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    throw new Error("No token provided");
  }

  return token;
};

/**
 * Verifies JWT token and finds associated account
 * @param {string} token - JWT token to verify
 * @returns {Object} Verified account object
 */
const verifyTokenAndGetAccount = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const account = await Account.findById(decoded.id);
    
    if (!account) {
      throw new Error("Account not found");
    }
    
    return account;
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      throw new Error("Invalid token");
    }
    throw err;
  }
};

/**
 * Middleware for general user authentication
 * Validates JWT token and attaches account to request object
 */
const auth = async (req, res, next) => {
  const clientIp = req.ip;  // Get the client's IP address

  // Check if the client is rate-limited
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: "Too many failed attempts. Please try again later." });
  }

  try {
    // Extract and validate token
    const token = validateAuthHeader(req);
    
    // Verify token and get account
    const account = await verifyTokenAndGetAccount(token);
    
    // Attach account and token to request
    req.account = account;
    req.token = token;
    
    next();
  } catch (error) {
    // Log failed authentication attempt
    const attempts = failedAuthAttempts.get(clientIp) || { count: 0, timestamp: Date.now() };
    attempts.count += 1;
    failedAuthAttempts.set(clientIp, attempts);

    // Handle specific error types
    switch (error.message) {
      case "No Authorization header provided":
      case "No token provided":
      case "Invalid token":
        return res.status(401).json({ error: error.message });
      case "Account not found":
        return res.status(404).json({ error: error.message });
      default:
        console.error("Authentication error:", error);
        return res.status(500).json({ error: "Server error during authentication" });
    }
  }
};

/**
 * Middleware for admin authentication
 * Extends user authentication to verify admin privileges with rate limiting
 */
const adminAuth = async (req, res, next) => {
  const clientIp = req.ip;  // Get the client's IP address

  // Check if the client is rate-limited
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: "Too many failed attempts. Please try again later." });
  }

  try {
    // Extract and validate token
    const token = validateAuthHeader(req);
    const account = await verifyTokenAndGetAccount(token);
    
    // Check admin privileges
    if (!account.isAdmin) {
      return res.status(403).json({ error: "Access denied. Admin privileges required" });
    }
    
    // Attach account and token to request
    req.account = account;
    req.token = token;
    
    next();
  } catch (error) {
    // Log failed authentication attempt
    const attempts = failedAuthAttempts.get(clientIp) || { count: 0, timestamp: Date.now() };
    attempts.count += 1;
    failedAuthAttempts.set(clientIp, attempts);

    // Handle specific error types
    switch (error.message) {
      case "No Authorization header provided":
      case "No token provided":
      case "Invalid token":
        return res.status(401).json({ error: error.message });
      case "Account not found":
        return res.status(404).json({ error: error.message });
      default:
        console.error("Admin authentication error:", error);
        return res.status(500).json({ error: "Server error during authentication" });
    }
  }
};

/**
 * Middleware for organizer authentication
 * Extends user authentication to verify organizer privileges with rate limiting
 */
const organizerAuth = async (req, res, next) => {
  const clientIp = req.ip;  // Get the client's IP address

  // Check if the client is rate-limited
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: "Too many failed attempts. Please try again later." });
  }

  try {
    // Extract and validate token
    const token = validateAuthHeader(req);
    const account = await verifyTokenAndGetAccount(token);
    
    // Check organizer privileges
    if (!account.isOrganizer) {
      return res.status(403).json({ error: "Access denied. Organizer privileges required" });
    }
    
    // Attach account and token to request
    req.account = account;
    req.token = token;
    
    next();
  } catch (error) {
    // Log failed authentication attempt
    const attempts = failedAuthAttempts.get(clientIp) || { count: 0, timestamp: Date.now() };
    attempts.count += 1;
    failedAuthAttempts.set(clientIp, attempts);

    // Handle specific error types
    switch (error.message) {
      case "No Authorization header provided":
      case "No token provided":
      case "Invalid token":
        return res.status(401).json({ error: error.message });
      case "Account not found":
        return res.status(404).json({ error: error.message });
      default:
        console.error("Organizer authentication error:", error);
        return res.status(500).json({ error: "Server error during authentication" });
    }
  }
};

// Add rate limiting for failed authentication attempts
const failedAuthAttempts = new Map();

/**
 * Helper to check for too many failed attempts
 * @param {string} clientIp - IP address of the client
 * @returns {boolean} Whether the client is rate limited
 */
const isRateLimited = (clientIp) => {
  const attempts = failedAuthAttempts.get(clientIp) || { count: 0, timestamp: Date.now() };
  
  // Reset counter after 15 minutes
  if (Date.now() - attempts.timestamp > 15 * 60 * 1000) {
    failedAuthAttempts.delete(clientIp);
    return false;
  }
  
  return attempts.count >= 5;
};

export { auth, adminAuth, organizerAuth };