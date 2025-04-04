const Event = require("../models/Event");
const User = require("../models/User");
const Organiser = require("../models/Organiser");
const Volunteer = require("../models/Volunteer");
const EventRegistration = require("../models/EventRegistration");
const Report = require("../models/Report");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

/**
 * Get all events with optional filters
 */
exports.getEvents = async (req, res) => {
  try {
    // Extract query parameters
    const {
      search,
      cause,
      location,
      dateStart,
      dateEnd,
      status = "active",
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    let query = { status };

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    // Add cause filter
    if (cause && cause !== "all") {
      query.causes = cause;
    }

    // Add location filter
    if (location && location !== "all") {
      query.location = { $regex: location, $options: "i" };
    }

    // Add date filters
    if (dateStart || dateEnd) {
      query.$and = [];

      if (dateStart) {
        query.$and.push({
          $or: [
            { start_date: { $gte: new Date(dateStart) } },
            {
              recurrence_start_date: {
                $gte: new Date(dateStart),
              },
            },
          ],
        });
      }

      if (dateEnd) {
        query.$and.push({
          $or: [
            { end_date: { $lte: new Date(dateEnd) } },
            { recurrence_end_date: { $lte: new Date(dateEnd) } },
          ],
        });
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const events = await Event.find(query)
      .sort({ start_date: 1, created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "organiser_id",
        select: "name description profile_picture_url",
      });

    // Get total count for pagination
    const total = await Event.countDocuments(query);

    return res.status(200).json({
      events,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error getting events:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Create a new event
 */
exports.createEvent = async (req, res) => {
  try {
    const userId = req.user.id;

    // Verify user is an organiser
    const user = await User.findById(userId);
    if (!user || user.role !== "organiser") {
      return res
        .status(403)
        .json({ message: "Only organisers can create events" });
    }

    // Get organiser profile
    const organiser = await Organiser.findOne({ user_id: userId });
    if (!organiser) {
      return res.status(404).json({ message: "Organiser profile not found" });
    }

    // Extract event data from request
    const {
      name,
      description,
      location,
      causes,
      max_volunteers,
      is_recurring,
      contact_person,
      contact_email,
      status = "active",
      // For non-recurring events
      start_date,
      end_date,
      start_time,
      end_time,
      // For recurring events
      recurrence_pattern,
      recurrence_days,
      recurrence_start_date,
      recurrence_end_date,
      recurrence_time,
    } = req.body;

    // Validate required fields
    if (!name || !description || !location) {
      return res.status(400).json({
        message: "Name, description, and location are required",
      });
    }

    // Get image_url from middleware (if uploaded)
    const image_url = req.body.image_url || null;

    // Create event object
    const newEvent = new Event({
      organiser_id: organiser._id,
      name,
      description,
      location,
      causes: causes || [],
      max_volunteers: max_volunteers || 0,
      registered_count: 0,
      contact_person: contact_person || organiser.name,
      contact_email: contact_email || user.email,
      status,
      is_recurring: is_recurring || false,
      image_url, // Add the image URL
      created_at: new Date(),
    });

    // Set specific fields based on event type
    if (is_recurring) {
      // Recurring event
      newEvent.recurrence_pattern = recurrence_pattern;
      newEvent.recurrence_days = recurrence_days || [];
      newEvent.recurrence_start_date = new Date(recurrence_start_date);
      newEvent.recurrence_end_date = new Date(recurrence_end_date);
      newEvent.recurrence_time = recurrence_time || {
        start: "09:00",
        end: "17:00",
      };
    } else {
      // Single event
      newEvent.start_datetime = new Date(
        start_date + (start_time ? "T" + start_time : "T00:00:00")
      );
      newEvent.end_datetime = new Date(
        end_date + (end_time ? "T" + end_time : "T23:59:59")
      );
      newEvent.start_day_of_week = newEvent.start_datetime.getDay();
    }

    // Save event
    const savedEvent = await newEvent.save();

    return res.status(201).json({
      message: "Event created successfully",
      event: savedEvent,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get details of a specific event
 */
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    // Find event by ID
    const event = await Event.findById(id).populate({
      path: "organiser_id",
      select: "name description profile_picture_url",
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Get registration count
    const registrationCount = await EventRegistration.countDocuments({
      event_id: id,
    });

    // Return event with registration count
    return res.status(200).json({
      ...event._doc,
      registered_count: registrationCount,
    });
  } catch (error) {
    console.error("Error getting event:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Update event details
 */
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    // Find event by ID
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Get organiser
    const organiser = await Organiser.findOne({ user_id: userId });
    if (!organiser) {
      return res.status(404).json({ message: "Organiser profile not found" });
    }

    // Check if user is the event organiser
    if (event.organiser_id.toString() !== organiser._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to update this event",
      });
    }

    // Extract update fields from request
    const updateFields = {};
    const allowedFields = [
      "name",
      "description",
      "location",
      "causes",
      "max_volunteers",
      "contact_person",
      "contact_email",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    // If middleware processed an image upload, get the new URL
    if (req.body.image_url) {
      updateFields.image_url = req.body.image_url;
    }

    // Handle special cases for dates and times
    if (event.is_recurring) {
      // Update recurring event fields
      if (req.body.recurrence_pattern)
        updateFields.recurrence_pattern = req.body.recurrence_pattern;
      if (req.body.recurrence_days)
        updateFields.recurrence_days = req.body.recurrence_days;
      if (req.body.recurrence_start_date)
        updateFields.recurrence_start_date = new Date(
          req.body.recurrence_start_date
        );
      if (req.body.recurrence_end_date)
        updateFields.recurrence_end_date = new Date(
          req.body.recurrence_end_date
        );
      if (req.body.recurrence_time)
        updateFields.recurrence_time = req.body.recurrence_time;
    } else {
      // Update single event fields
      if (req.body.start_date || req.body.start_time) {
        const start_date =
          req.body.start_date ||
          event.start_datetime.toISOString().split("T")[0];
        const start_time =
          req.body.start_time ||
          event.start_datetime.toTimeString().split(" ")[0].substring(0, 5);
        updateFields.start_datetime = new Date(start_date + "T" + start_time);
        updateFields.start_day_of_week = updateFields.start_datetime.getDay();
      }

      if (req.body.end_date || req.body.end_time) {
        const end_date =
          req.body.end_date || event.end_datetime.toISOString().split("T")[0];
        const end_time =
          req.body.end_time ||
          event.end_datetime.toTimeString().split(" ")[0].substring(0, 5);
        updateFields.end_datetime = new Date(end_date + "T" + end_time);
      }
    }

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Delete an event
 */
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    // Find event by ID
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Get organiser
    const organiser = await Organiser.findOne({ user_id: userId });
    if (!organiser) {
      return res.status(404).json({ message: "Organiser profile not found" });
    }

    // Check if user is the event organiser
    if (event.organiser_id.toString() !== organiser._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to delete this event",
      });
    }

    // If the event has an image, try to remove the file
    if (event.image_url) {
      try {
        // Extract the filename from the URL
        const urlParts = event.image_url.split("/");
        const filename = urlParts[urlParts.length - 1];
        const filePath = path.join("public", "uploads", "events", filename);

        // Check if file exists and delete it
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted image file: ${filePath}`);
        }
      } catch (error) {
        console.error("Error deleting image file:", error);
        // Continue with event deletion even if image deletion fails
      }
    }

    // Delete all registrations for this event
    await EventRegistration.deleteMany({ event_id: id });

    // Delete all reports related to this event
    await Report.deleteMany({ reported_type: "Event", reported_id: id });

    // Delete the event
    await Event.findByIdAndDelete(id);

    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Register for an event
 */
exports.registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    // Verify user is a volunteer
    const user = await User.findById(userId);
    if (!user || user.role !== "volunteer") {
      return res
        .status(403)
        .json({ message: "Only volunteers can register for events" });
    }

    // Get volunteer profile
    const volunteer = await Volunteer.findOne({ user_id: userId });
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer profile not found" });
    }

    // Find event by ID
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if event is active
    if (event.status !== "active") {
      return res
        .status(400)
        .json({ message: "Cannot register for an inactive event" });
    }

    // Check if event has reached max capacity
    if (
      event.max_volunteers > 0 &&
      event.registered_count >= event.max_volunteers
    ) {
      return res
        .status(400)
        .json({ message: "Event has reached maximum capacity" });
    }

    // Check if already registered
    const existingRegistration = await EventRegistration.findOne({
      volunteer_id: volunteer._id,
      event_id: id,
    });

    if (existingRegistration) {
      return res
        .status(400)
        .json({ message: "You are already registered for this event" });
    }

    // Create new registration
    const registration = new EventRegistration({
      volunteer_id: volunteer._id,
      event_id: id,
      status: "registered",
      registration_date: new Date(),
    });

    // Save registration (without transactions)
    await registration.save();

    // Increment registered_count on event
    await Event.findByIdAndUpdate(id, { $inc: { registered_count: 1 } });

    return res.status(201).json({
      message: "Registered for event successfully",
      registration,
    });
  } catch (error) {
    console.error("Error registering for event:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Cancel event registration
 */
exports.cancelRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    // Get volunteer profile
    const volunteer = await Volunteer.findOne({ user_id: userId });
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer profile not found" });
    }

    // Find registration
    const registration = await EventRegistration.findOne({
      volunteer_id: volunteer._id,
      event_id: id,
    });

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    // Delete registration (without transactions)
    await EventRegistration.findByIdAndDelete(registration._id);

    // Decrement registered_count on event
    await Event.findByIdAndUpdate(id, { $inc: { registered_count: -1 } });

    return res
      .status(200)
      .json({ message: "Registration cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling registration:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Report an event
 */
exports.reportEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { reason, details } = req.body;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    // Validate reason
    if (!reason) {
      return res.status(400).json({ message: "Reason is required" });
    }

    // Get user role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find event by ID
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Create report
    const report = new Report({
      reporter_id: userId,
      reporter_role: user.role,
      reported_type: "Event",
      reported_id: id,
      event_id: id,
      reason,
      details: details || "",
      created_at: new Date(),
      status: "pending",
    });

    // Save report
    await report.save();

    return res.status(201).json({
      message: "Event reported successfully",
      report,
    });
  } catch (error) {
    console.error("Error reporting event:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get personalized event recommendations
 */
exports.getRecommendedEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;

    // Verify user is a volunteer
    const user = await User.findById(userId);
    if (!user || user.role !== "volunteer") {
      return res.status(403).json({
        message: "Recommendations are only available for volunteers",
      });
    }

    // Get volunteer profile
    const volunteer = await Volunteer.findOne({ user_id: userId });
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer profile not found" });
    }

    // Get volunteer's skills and preferred causes
    const skills = volunteer.skills || [];
    const preferredCauses = volunteer.preferred_causes || [];

    // Get events already registered for
    const registrations = await EventRegistration.find({
      volunteer_id: volunteer._id,
    });
    const registeredEventIds = registrations.map((reg) => reg.event_id);

    // Build recommendation query
    let recommendationQuery = {
      status: "active",
      _id: { $nin: registeredEventIds },
    };

    // Add cause preferences if available
    if (preferredCauses.length > 0) {
      recommendationQuery.causes = { $in: preferredCauses };
    }

    // Find recommended events
    let recommendedEvents = await Event.find(recommendationQuery)
      .sort({ start_date: 1, created_at: -1 })
      .limit(limit)
      .populate({
        path: "organiser_id",
        select: "name",
      });

    // If not enough events found, find more without cause filter
    if (recommendedEvents.length < limit) {
      const remainingLimit = limit - recommendedEvents.length;

      const additionalEvents = await Event.find({
        status: "active",
        _id: {
          $nin: [...registeredEventIds, ...recommendedEvents.map((e) => e._id)],
        },
      })
        .sort({ start_date: 1, created_at: -1 })
        .limit(remainingLimit)
        .populate({
          path: "organiser_id",
          select: "name",
        });

      recommendedEvents = [...recommendedEvents, ...additionalEvents];
    }

    return res.status(200).json({ recommendedEvents });
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
