/**
 * Event Routes
 * Handles routes for event management and participation
 */
const express = require("express");
const router = express.Router();
const {
	createEvent,
	getEvents,
	getEventById,
	updateEvent,
	deleteEvent,
	registerForEvent,
	cancelRegistration,
	getRegisteredEvents,
	getOrganizedEvents,
	reportEvent,
	getRecommendedEvents,
} = require("../controllers/eventController");
const { protectRoute } = require("../middleware/authMiddleware");

// Public even routes (no authentication required)
router.get("/", getEvents);
router.get("/:id", getEventById);

// Protected event routes (require authentication)
router.use(protectRoute);

// Event creation and management - typically for organisers
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

// Event registration routes - for volunteers
router.post("/:id/register", registerForEvent);
router.delete("/:id/register", cancelRegistration);

// User-specific event lists
router.get("/user/registered", getRegisteredEvents);
router.get("/user/organized", getOrganizedEvents);

// Event recommendations
router.get("/recommendations", getRecommendedEvents);

// Event reporting route
router.post("/:id/report", reportEvent);

module.exports = router;
