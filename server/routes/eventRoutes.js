const express = require("express");
const { createEvent, getEvents, getEventById, updateEvent, deleteEvent } = require("./eventController");

const router = express.Router();
router.post("/events", createEvent);
router.get("/events", getEvents);
router.get("/events/:id", getEventById);
router.put("/events/:id", updateEvent);
router.delete("/events/:id", deleteEvent);

module.exports = router;
