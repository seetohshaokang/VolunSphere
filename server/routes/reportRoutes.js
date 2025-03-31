const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { protectRoute } = require("../middleware/authMiddleware");

/**
 * @route   GET /reports
 * @desc    Get reports submitted by current user
 * @access  Private
 */
router.get("/", protectRoute, reportController.getUserReports);

/**
 * @route   POST /reports
 * @desc    Create a new report
 * @access  Private
 */
router.post("/", protectRoute, reportController.createReport);

/**
 * @route   GET /reports/:id
 * @desc    Get specific report details
 * @access  Private (Owner or Admin)
 */
router.get("/:id", protectRoute, reportController.getReportById);

/**
 * @route   PUT /reports/:id
 * @desc    Update an existing report
 * @access  Private (Owner)
 */
router.put("/:id", protectRoute, reportController.updateReport);

/**
 * @route   DELETE /reports/:id
 * @desc    Delete a report
 * @access  Private (Owner)
 */
router.delete("/:id", protectRoute, reportController.deleteReport);

module.exports = router;
