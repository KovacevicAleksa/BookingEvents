import express from "express";
import { auth, adminAuth } from "../middleware/auth.js";
import mongoose from "mongoose"; // For ObjectId validation
import Report from "../models/report.js";

const router = express.Router();

// Route to get all reports (Admin only)
router.get("/report", adminAuth, async (req, res) => {
  try {
    const reports = await Report.find();
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Route to add a new report
router.post("/report", auth, async (req, res) => {
  const { email, reportText, category } = req.body;

  if (!email || !reportText || !category) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newReport = new Report({ email, reportText, category });
    await newReport.save();
    res.status(201).json({ message: "Report submitted successfully", newReport });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit report" });
  }
});

// Route to delete a specific report by ID (Admin only)
router.delete("/report/:id", adminAuth, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid report ID" });
  }

  try {
    const deletedReport = await Report.findByIdAndDelete(id);
    if (!deletedReport) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete report" });
  }
});

export default router;
