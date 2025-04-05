const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const reviewController = require("../controllers/reviewController");
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
 * @route   POST /api/events/:id/signup
 * @desc    Sign up for an event
 * @access  Private
 */
router.post("/:id/signup", protectRoute, eventController.signupForEvent);

/**
 * @route   DELETE /api/events/:id/signup
 * @desc    Remove signup from an event
 * @access  Private
 */
router.delete("/:id/signup", protectRoute, eventController.removeEventSignup);

/**
 * @route   GET /api/events/:id/signup/status
 * @desc    Check if user is signed up for an event
 * @access  Private
 */
router.get("/:id/signup/status", protectRoute, eventController.checkSignupStatus);

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
 * @route   GET /api/events/:id/reviews
 * @desc    Get all reviews for an event
 * @access  Public
 */
router.get("/:id/reviews", reviewController.getEventReviews);

/**
 * @route   POST /api/events/:id/reviews
 * @desc    Create a review for an event
 * @access  Private
 */
router.post("/:id/reviews", protectRoute, reviewController.createEventReview);

/**
 * @route   PUT /api/events/:id/reviews/:reviewId
 * @desc    Update a review
 * @access  Private (Review Owner)
 */
router.put("/:id/reviews/:reviewId", protectRoute, reviewController.updateEventReview);

/**
 * @route   DELETE /api/events/:id/reviews/:reviewId
 * @desc    Delete a review
 * @access  Private (Review Owner)
 */
router.delete("/:id/reviews/:reviewId", protectRoute, reviewController.deleteEventReview);

module.exports = router;
