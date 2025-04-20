const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const reviewController = require("../controllers/reviewController");
const { protectRoute, requireRole } = require("../middleware/authMiddleware");
const eventImageUpload = require("../middleware/eventImageUploadMiddleware");

router.get("/", eventController.getEvents);

router.post(
  "/",
  protectRoute,
  requireRole("organiser"),
  eventImageUpload, // Add the image upload middleware
  eventController.createEvent
);

router.get("/:id", eventController.getEventById);

router.put(
  "/:id",
  protectRoute,
  eventImageUpload, // Add the image upload middleware
  eventController.updateEvent
);

router.delete("/:id", protectRoute, eventController.deleteEvent);

router.post("/:id/signup", protectRoute, eventController.signupForEvent);

router.delete("/:id/signup", protectRoute, eventController.removeEventSignup);

router.delete("/:id/signup", protectRoute, eventController.removeEventSignup);

router.get(
  "/:id/signup/status",
  protectRoute,
  eventController.checkSignupStatus
);

router.post("/:id/reports", protectRoute, eventController.reportEvent);

router.get(
  "/recommendations",
  protectRoute,
  requireRole("volunteer"),
  eventController.getRecommendedEvents
);

router.get("/:id/reviews", reviewController.getEventReviews);

router.post("/:id/reviews", protectRoute, reviewController.createEventReview);

router.put(
  "/:id/reviews/:reviewId",
  protectRoute,
  reviewController.updateEventReview
);

router.delete(
  "/:id/reviews/:reviewId",
  protectRoute,
  reviewController.deleteEventReview
);

router.get(
  "/:id/volunteers",
  protectRoute,
  requireRole("organiser"),
  eventController.getEventVolunteers
);

module.exports = router;
