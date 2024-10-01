import rateLimit from "express-rate-limit";

// Rate limiter for password reset attempts
const resetAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per hour
  message: "Too many password reset attempts, please try again later.",
});

export { resetAccountLimiter };
