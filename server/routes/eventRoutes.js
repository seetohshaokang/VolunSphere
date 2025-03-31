const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { protectRoute, requireRole } = require("../middleware/authMiddleware");

/**
 * @route   GET /events
 * @desc    Get all events with optional filters
 * @access  Public
 */
router.get("/", eventController.getEvents);

/**
 * @route   POST /events
 * @desc    Create a new event
 * @access  Private (Organiser only)
 */
router.post(
	"/",
	protectRoute,
	requireRole("organiser"),
	eventController.createEvent
);

/**
 * @route   GET /events/:id
 * @desc    Get details of a specific event
 * @access  Public
 */
router.get("/:id", eventController.getEventById);

/**
 * @route   PUT /events/:id
 * @desc    Update event details
 * @access  Private (Event Owner)
 */
router.put("/:id", protectRoute, eventController.updateEvent);

/**
 * @route   DELETE /events/:id
 * @desc    Delete an event
 * @access  Private (Event Owner)
 */
router.delete("/:id", protectRoute, eventController.deleteEvent);

/**
 * @route   POST /events/:id/registrations
 * @desc    Register for an event
 * @access  Private (Volunteer only)
 */
router.post(
	"/:id/registrations",
	protectRoute,
	requireRole("volunteer"),
	eventController.registerForEvent
);

/**
 * @route   DELETE /events/:id/registrations
 * @desc    Cancel event registration
 * @access  Private (Volunteer only)
 */
router.delete(
	"/:id/registrations",
	protectRoute,
	requireRole("volunteer"),
	eventController.cancelRegistration
);

/**
 * @route   POST /events/:id/reports
 * @desc    Report an event
 * @access  Private
 */
router.post("/:id/reports", protectRoute, eventController.reportEvent);

/**
 * @route   GET /events/recommendations
 * @desc    Get personalized event recommendations
 * @access  Private (Volunteer only)
 */
router.get(
	"/recommendations",
	protectRoute,
	requireRole("volunteer"),
	eventController.getRecommendedEvents
);

module.exports = router;
