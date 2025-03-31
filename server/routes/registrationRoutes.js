const express = require("express");
const router = express.Router();
const registrationController = require("../controllers/registrationController");
const { protectRoute, requireRole } = require("../middleware/authMiddleware");

/**
 * @route   GET /registrations
 * @desc    Get current user's event registrations
 * @access  Private
 */
router.get("/", protectRoute, registrationController.getUserRegistrations);

/**
 * @route   POST /registrations
 * @desc    Register for an event
 * @access  Private (Volunteer only)
 */
router.post(
	"/",
	protectRoute,
	requireRole("volunteer"),
	registrationController.createRegistration
);

/**
 * @route   GET /registrations/:id
 * @desc    Get specific registration details
 * @access  Private
 */
router.get("/:id", protectRoute, registrationController.getRegistrationById);

/**
 * @route   PUT /registrations/:id
 * @desc    Update registration (e.g., add feedback)
 * @access  Private
 */
router.put("/:id", protectRoute, registrationController.updateRegistration);

/**
 * @route   DELETE /registrations/:id
 * @desc    Cancel event registration
 * @access  Private
 */
router.delete("/:id", protectRoute, registrationController.cancelRegistration);

/**
 * @route   POST /registrations/:id/check-in
 * @desc    Record volunteer check-in
 * @access  Private (Organiser only)
 */
router.post(
	"/:id/check-in",
	protectRoute,
	requireRole("organiser"),
	registrationController.checkInRegistration
);

/**
 * @route   POST /registrations/:id/check-out
 * @desc    Record volunteer check-out
 * @access  Private (Organiser only)
 */
router.post(
	"/:id/check-out",
	protectRoute,
	requireRole("organiser"),
	registrationController.checkOutRegistration
);

/**
 * @route   POST /registrations/:id/feedback
 * @desc    Add feedback to registration
 * @access  Private
 */
router.post("/:id/feedback", protectRoute, registrationController.addFeedback);

module.exports = router;
