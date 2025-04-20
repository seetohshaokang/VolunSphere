const Report = require("../models/Report");
const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const Organiser = require("../models/Organiser");
const Event = require("../models/Event");
const mongoose = require("mongoose");

exports.getUserReports = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find reports where the user is the reporter
    const reports = await Report.find({ reporter_id: userId })
      .populate({
        path: "reported_id",
        select: "name name",
      })
      .populate("event_id", "name")
      .sort({ created_at: -1 });

    return res.status(200).json({ reports });
  } catch (error) {
    console.error("Error getting reports:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.createReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reported_type, reported_id, event_id, reason, details } = req.body;

    // Validate required fields
    if (!reported_type || !reported_id || !reason) {
      return res.status(400).json({
        message: "Reported type, ID, and reason are required",
      });
    }

    // Validate the reported type
    if (!["Volunteer", "Organiser", "Event"].includes(reported_type)) {
      return res.status(400).json({ message: "Invalid reported type" });
    }

    // Validate reported_id is valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(reported_id)) {
      return res.status(400).json({ message: "Invalid reported ID" });
    }

    // Get user role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify the reported entity exists
    let reportedEntity;
    if (reported_type === "Volunteer") {
      // CAPITALIZED
      reportedEntity = await Volunteer.findById(reported_id);
    } else if (reported_type === "Organiser") {
      // CAPITALIZED
      reportedEntity = await Organiser.findById(reported_id);
    } else if (reported_type === "Event") {
      // CAPITALIZED
      reportedEntity = await Event.findById(reported_id);
    }

    if (!reportedEntity) {
      return res.status(404).json({ message: `${reported_type} not found` });
    }

    // Validate event_id if provided
    if (event_id && !mongoose.Types.ObjectId.isValid(event_id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    // Create report
    const report = new Report({
      reporter_id: userId,
      reporter_role: user.role,
      reported_type,
      reported_id,
      event_id: event_id || null,
      reason,
      details: details || "",
      created_at: new Date(),
      status: "pending",
    });

    // Save report
    await report.save();

    return res.status(201).json({
      message: "Report submitted successfully",
      report,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate report ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    // Find report
    const report = await Report.findById(id)
      .populate("reporter_id", "email")
      .populate({
        path: "reported_id",
        select: "name name",
      })
      .populate("event_id");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Get user role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is admin or report creator
    if (user.role !== "admin" && report.reporter_id._id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this report" });
    }

    return res.status(200).json({ report });
  } catch (error) {
    console.error("Error getting report:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { reason, details } = req.body;

    // Validate report ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    // Find report
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Check if user is the report creator
    if (report.reporter_id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this report" });
    }

    // Check if report is still pending
    if (report.status !== "pending") {
      return res.status(400).json({
        message:
          "Cannot update a report that is already under review or resolved",
      });
    }

    // Update fields
    if (reason) report.reason = reason;
    if (details !== undefined) report.details = details;

    // Save updated report
    await report.save();

    return res.status(200).json({
      message: "Report updated successfully",
      report,
    });
  } catch (error) {
    console.error("Error updating report:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate report ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    // Find report
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Check if user is the report creator
    if (report.reporter_id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this report" });
    }

    // Check if report is still pending
    if (report.status !== "pending") {
      return res.status(400).json({
        message:
          "Cannot delete a report that is already under review or resolved",
      });
    }

    // Delete report
    await Report.findByIdAndDelete(id);

    return res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
