// server/routes/certificateRoutes.js
const express = require("express");
const router = express.Router();
const certificateController = require("../controllers/certificateController");
const { protectRoute, requireRole } = require("../middleware/authMiddleware");

/**
 * @route   POST /api/certificates/generate/:eventId
 * @desc    Generate certificate for an event
 * @access  Private (Volunteer only)
 */
router.post(
	"/generate/:eventId",
	protectRoute,
	requireRole("volunteer"),
	certificateController.generateCertificate
);

/**
 * @route   GET /api/certificates/download/:certificateId
 * @desc    Download certificate PDF
 * @access  Public (with certificate ID)
 */
router.get(
	"/download/:certificateId",
	certificateController.downloadCertificate
);

/**
 * @route   GET /api/certificates/verify/:certificateId
 * @desc    Verify certificate authenticity
 * @access  Public
 */
router.get("/verify/:certificateId", certificateController.verifyCertificate);

/**
 * @route   GET /api/certificates/volunteer
 * @desc    Get all certificates for a volunteer
 * @access  Private (Volunteer only)
 */
router.get(
	"/volunteer",
	protectRoute,
	requireRole("volunteer"),
	certificateController.getVolunteerCertificates
);

module.exports = router;
