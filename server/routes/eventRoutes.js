const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { protectRoute, requireRole } = require("../middleware/authMiddleware");
const eventImageUpload = require("../middleware/eventImageUploadMiddleware");

/**
 * @route   GET /api/events
 * @desc    Get all events with optional filters
 * @access  Public
 */
router.get("/", eventController.getEvents);

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private (Organiser only)
 */
router.post(
  "/",
  protectRoute,
  requireRole("organiser"),
  eventImageUpload, // Add the image upload middleware
  eventController.createEvent
);

/**
 * @route   GET /api/events/:id
 * @desc    Get details of a specific event
 * @access  Public
 */
router.get("/:id", eventController.getEventById);

/**
 * @route   PUT /api/events/:id
 * @desc    Update event details
 * @access  Private (Event Owner)
 */
router.put(
  "/:id",
  protectRoute,
  eventImageUpload, // Add the image upload middleware
  eventController.updateEvent
);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event
 * @access  Private (Event Owner)
 */
router.delete("/:id", protectRoute, eventController.deleteEvent);

/**
 * @route   POST /api/events/:id/registrations
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
 * @route   DELETE /api/events/:id/registrations
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
 * @route   POST /api/events/:id/reports
 * @desc    Report an event
 * @access  Private
 */
router.post("/:id/reports", protectRoute, eventController.reportEvent);

/**
 * @route   GET /api/events/recommendations
 * @desc    Get personalized event recommendations
 * @access  Private (Volunteer only)
 */
router.get(
  "/recommendations",
  protectRoute,
  requireRole("volunteer"),
  eventController.getRecommendedEvents
);

/**
 * @route   GET /api/events/:id/volunteers
 * @desc    Get registered volunteers for an event
 * @access  Private (Event Organiser)
 */
router.get(
  "/:id/volunteers",
  protectRoute,
  requireRole("organiser"),
  eventController.getEventVolunteers
);

module.exports = router;
