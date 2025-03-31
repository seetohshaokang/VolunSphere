const Report = require("../models/Report");
const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const Organiser = require("../models/Organiser");
const Event = require("../models/Event");
const mongoose = require("mongoose");

/**
 * Get reports submitted by current user
 *
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user information
 * @param {string} req.user.id - User ID
 * @param {Object} res - Express response object
 *
 * @returns {Object} JSON response with user's submitted reports
 * @throws {Error} If server error occurs during report retrieval
 *
 * Steps:
 * 1. Find reports where the user is the reporter
 * 2. Populate reported entity and event details
 * 3. Sort by creation date
 * 4. Return reports
 */
exports.getUserReports = async (req, res) => {
	try {
		const userId = req.user.id;

		// Find reports where the user is the reporter
		const reports = await Report.find({ reporter_id: userId })
			.populate({
				path: "reported_id",
				select: "name organisation_name",
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

/**
 * Create a new report
 *
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user information
 * @param {string} req.user.id - User ID
 * @param {Object} req.body - Report details
 * @param {string} req.body.reported_type - Type of entity being reported (volunteer, organiser, event)
 * @param {string} req.body.reported_id - ID of entity being reported
 * @param {string} [req.body.event_id] - Associated event ID (if applicable)
 * @param {string} req.body.reason - Reason for report
 * @param {string} [req.body.details] - Additional details
 * @param {Object} res - Express response object
 *
 * @returns {Object} JSON response with created report
 * @throws {Error} If server error occurs during report creation
 *
 * Steps:
 * 1. Validate required fields
 * 2. Validate the reported type
 * 3. Validate reported_id is valid ObjectId
 * 4. Get user role
 * 5. Verify the reported entity exists
 * 6. Validate event_id if provided
 * 7. Create report
 * 8. Save report
 * 9. Return success message with report details
 */
exports.createReport = async (req, res) => {
	try {
		const userId = req.user.id;
		const { reported_type, reported_id, event_id, reason, details } =
			req.body;

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
			return res
				.status(404)
				.json({ message: `${reported_type} not found` });
		}

		// Validate event_id if provided
		if (event_id && !mongoose.Types.ObjectId.isValid(event_id)) {
			return res.status(400).json({ message: "Invalid event ID" });
		}

		// Create report
		const report = new Report({
			reporter_id: userId,
			reporter_role: user.role,
			reported_type, // Already capitalized from input
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

/**
 * Get specific report details
 *
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Report ID
 * @param {Object} req.user - Authenticated user information
 * @param {string} req.user.id - User ID
 * @param {Object} res - Express response object
 *
 * @returns {Object} JSON response with report details
 * @throws {Error} If server error occurs during report retrieval
 *
 * Steps:
 * 1. Validate report ID
 * 2. Find report with populated details
 * 3. Get user role
 * 4. Check if user is admin or report creator
 * 5. Return report details
 */
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
				select: "name organisation_name",
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
		if (
			user.role !== "admin" &&
			report.reporter_id._id.toString() !== userId
		) {
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

/**
 * Update an existing report
 *
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Report ID
 * @param {Object} req.user - Authenticated user information
 * @param {string} req.user.id - User ID
 * @param {Object} req.body - Updated report details
 * @param {string} [req.body.reason] - Updated reason
 * @param {string} [req.body.details] - Updated details
 * @param {Object} res - Express response object
 *
 * @returns {Object} JSON response with updated report
 * @throws {Error} If server error occurs during report update
 *
 * Steps:
 * 1. Validate report ID
 * 2. Find report
 * 3. Check if user is the report creator
 * 4. Check if report is still pending
 * 5. Update fields
 * 6. Save updated report
 * 7. Return success message with updated report
 */
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

/**
 * Delete a report
 *
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Report ID
 * @param {Object} req.user - Authenticated user information
 * @param {string} req.user.id - User ID
 * @param {Object} res - Express response object
 *
 * @returns {Object} JSON response with deletion status
 * @throws {Error} If server error occurs during report deletion
 *
 * Steps:
 * 1. Validate report ID
 * 2. Find report
 * 3. Check if user is the report creator
 * 4. Check if report is still pending
 * 5. Delete report
 * 6. Return success message
 */
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
