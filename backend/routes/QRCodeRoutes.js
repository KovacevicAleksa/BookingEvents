import express from "express";
import QRCode from "qrcode"; // Use qrcode library for Node.js
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Endpoint for generating a 2D QR Code
router.post("/generate-qrcode", auth, async (req, res) => {
  try {
    const { text } = req.body; // Text or data to encode in the QR Code

    if (!text) {
      return res.status(400).json({ error: "Text to encode is required" });
    }

    // Generate QR Code as a data URL (Base64-encoded PNG)
    const qrCodeDataUrl = await QRCode.toDataURL(text);

    // Respond with the QR code image
    res.status(200).json({ qrCode: qrCodeDataUrl });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(error); // Log errors only if not in test environment
    }
    res.status(500).json({ error: "Failed to generate QR Code" });
  }
});

export default router;
