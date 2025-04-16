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
 * Get all events with optional filters and real-time status check
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
    let query = {};

    // If specifically requesting active events, we'll handle this differently
    // to account for date-based status checks
    if (status !== "all") {
      if (status === "active") {
        // For active events, we'll filter in memory after retrieval
        query.status = "active";
      } else {
        // For all other statuses (completed, cancelled, draft), use direct query
        query.status = status;
      }
    }

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
    let events = await Event.find(query)
      .sort({ start_date: 1, created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "organiser_id",
        select: "name description profile_picture_url",
      });

    // Get total count for pagination (before filtering for expired events)
    const total = await Event.countDocuments(query);

    // Current date for checking expired events
    const now = new Date();

    // Update expired events' status in memory
    events = events.map((event) => {
      // Create a mutable copy
      const eventObj = event.toObject();

      // Check if the event should be marked as completed based on dates
      if (eventObj.status === "active") {
        if (
          (eventObj.is_recurring &&
            eventObj.recurrence_end_date &&
            eventObj.recurrence_end_date < now) ||
          (!eventObj.is_recurring &&
            eventObj.end_datetime &&
            eventObj.end_datetime < now)
        ) {
          eventObj.status = "completed";

          // Asynchronously update the database (doesn't affect current response)
          Event.findByIdAndUpdate(eventObj._id, { status: "completed" }).catch(
            (err) => {
              console.error(
                `Error updating event ${eventObj._id} status:`,
                err
              );
            }
          );
        }
      }

      return eventObj;
    });

    // If specifically requesting active events, filter out any that are now completed
    if (status === "active") {
      events = events.filter((event) => event.status === "active");
    }

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

    console.log("Creating event. Request body:", req.body);

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

    console.log("Processing event data. is_recurring:", is_recurring);
    console.log("Event type is:", typeof is_recurring, is_recurring);

    // Determine if event is recurring - handle various formats
    const isEventRecurring =
      is_recurring === true ||
      is_recurring === "true" ||
      is_recurring === 1 ||
      is_recurring === "1";

    console.log("Determined is_recurring value:", isEventRecurring);

    if (isEventRecurring) {
      console.log("Processing as recurring event");
      console.log(
        "Recurring dates:",
        recurrence_start_date,
        recurrence_end_date
      );
      console.log("Recurrence days:", recurrence_days);
      console.log("Recurrence time:", recurrence_time);
    } else {
      console.log("Processing as single event");
      console.log(
        "Single event dates:",
        start_date,
        end_date,
        start_time,
        end_time
      );
    }

    // Validate required fields
    if (!name || !description || !location) {
      return res.status(400).json({
        message: "Name, description, and location are required",
      });
    }

    // Get image_url from middleware (if uploaded)
    const image_url = req.body.image_url || null;

    // Process causes - handle string or array
    let processedCauses;
    try {
      processedCauses =
        typeof causes === "string" ? JSON.parse(causes) : causes || [];
    } catch (err) {
      console.error("Error parsing causes:", err);
      // If parsing fails, try to handle it as a string
      processedCauses = causes ? [causes] : [];
    }

    // Create event object with common fields
    const newEvent = new Event({
      organiser_id: organiser._id,
      name,
      description,
      location,
      causes: processedCauses,
      max_volunteers: max_volunteers ? parseInt(max_volunteers, 10) : 0,
      registered_count: 0,
      contact_person: contact_person || organiser.name,
      contact_email: contact_email || user.email,
      status,
      is_recurring: isEventRecurring,
      image_url,
      created_at: new Date(),
    });

    // Set specific fields based on event type
    if (isEventRecurring) {
      // Recurring event logic

      // 1. Process recurrence pattern
      newEvent.recurrence_pattern = recurrence_pattern || "weekly";

      // 2. Process recurrence days - handle string or array
      try {
        if (recurrence_days) {
          if (typeof recurrence_days === "string") {
            // Try to parse as JSON
            try {
              newEvent.recurrence_days = JSON.parse(recurrence_days);
            } catch (e) {
              // If not valid JSON, try to parse as comma-separated values
              newEvent.recurrence_days = recurrence_days
                .split(",")
                .map((day) => parseInt(day.trim()));
            }
          } else if (Array.isArray(recurrence_days)) {
            newEvent.recurrence_days = recurrence_days;
          } else {
            // Default to an empty array
            newEvent.recurrence_days = [];
          }
        } else {
          // Default to an empty array if no days provided
          newEvent.recurrence_days = [];
        }
      } catch (err) {
        console.error("Error processing recurrence days:", err);
        newEvent.recurrence_days = [];
      }

      // 3. Process recurrence dates - validate before setting
      if (recurrence_start_date) {
        try {
          const parsedDate = new Date(recurrence_start_date);
          if (!isNaN(parsedDate.getTime())) {
            newEvent.recurrence_start_date = parsedDate;
            console.log(
              "Valid recurrence start date:",
              newEvent.recurrence_start_date
            );
          } else {
            console.error(
              "Invalid recurrence start date:",
              recurrence_start_date
            );
            return res.status(400).json({
              message: "Invalid recurrence start date format",
            });
          }
        } catch (err) {
          console.error("Error parsing recurrence start date:", err);
          return res.status(400).json({
            message: "Invalid recurrence start date: " + recurrence_start_date,
          });
        }
      } else {
        // Start date is required
        return res.status(400).json({
          message: "Recurrence start date is required for recurring events",
        });
      }

      if (recurrence_end_date) {
        try {
          const parsedDate = new Date(recurrence_end_date);
          if (!isNaN(parsedDate.getTime())) {
            newEvent.recurrence_end_date = parsedDate;
            console.log(
              "Valid recurrence end date:",
              newEvent.recurrence_end_date
            );
          } else {
            console.error("Invalid recurrence end date:", recurrence_end_date);
            return res.status(400).json({
              message: "Invalid recurrence end date format",
            });
          }
        } catch (err) {
          console.error("Error parsing recurrence end date:", err);
          return res.status(400).json({
            message: "Invalid recurrence end date: " + recurrence_end_date,
          });
        }
      } else {
        // End date is required
        return res.status(400).json({
          message: "Recurrence end date is required for recurring events",
        });
      }

      // 4. Process recurrence time
      try {
        if (typeof recurrence_time === "string") {
          try {
            newEvent.recurrence_time = JSON.parse(recurrence_time);
          } catch (e) {
            // If parsing fails, default to standard times
            newEvent.recurrence_time = { start: "09:00", end: "17:00" };
          }
        } else if (recurrence_time && typeof recurrence_time === "object") {
          newEvent.recurrence_time = recurrence_time;
        } else {
          // Default times
          newEvent.recurrence_time = { start: "09:00", end: "17:00" };
        }
      } catch (err) {
        console.error("Error parsing recurrence time:", err);
        newEvent.recurrence_time = { start: "09:00", end: "17:00" };
      }

      console.log("Processed recurring event data:", {
        pattern: newEvent.recurrence_pattern,
        days: newEvent.recurrence_days,
        start_date: newEvent.recurrence_start_date,
        end_date: newEvent.recurrence_end_date,
        time: newEvent.recurrence_time,
      });

      // Make sure we don't include non-recurring fields that would trigger validation
      newEvent.start_datetime = undefined;
      newEvent.end_datetime = undefined;
    } else {
      // Non-recurring event logic

      // Process start date and time
      if (!start_date) {
        return res.status(400).json({
          message: "Start date is required for non-recurring events",
        });
      }

      if (!end_date) {
        return res.status(400).json({
          message: "End date is required for non-recurring events",
        });
      }

      try {
        const startDateStr =
          start_date + (start_time ? `T${start_time}:00` : "T00:00:00");
        console.log("Creating start_datetime from:", startDateStr);
        const startDateTime = new Date(startDateStr);

        if (isNaN(startDateTime.getTime())) {
          console.error("Invalid start_datetime:", startDateTime);
          return res.status(400).json({
            message: `Invalid start date/time: ${start_date} ${start_time}`,
          });
        }

        newEvent.start_datetime = startDateTime;
        newEvent.start_day_of_week = startDateTime.getDay();
        console.log("Valid start_datetime:", newEvent.start_datetime);
      } catch (err) {
        console.error("Error creating start date:", err);
        return res.status(400).json({
          message: `Invalid start date/time: ${start_date} ${start_time}`,
        });
      }

      // Process end date and time
      try {
        const endDateStr =
          end_date + (end_time ? `T${end_time}:00` : "T23:59:59");
        console.log("Creating end_datetime from:", endDateStr);
        const endDateTime = new Date(endDateStr);

        if (isNaN(endDateTime.getTime())) {
          console.error("Invalid end_datetime:", endDateTime);
          return res.status(400).json({
            message: `Invalid end date/time: ${end_date} ${end_time}`,
          });
        }

        newEvent.end_datetime = endDateTime;
        console.log("Valid end_datetime:", newEvent.end_datetime);
      } catch (err) {
        console.error("Error creating end date:", err);
        return res.status(400).json({
          message: `Invalid end date/time: ${end_date} ${end_time}`,
        });
      }

      // Make sure we don't include recurring fields that would trigger validation
      newEvent.recurrence_pattern = undefined;
      newEvent.recurrence_days = undefined;
      newEvent.recurrence_start_date = undefined;
      newEvent.recurrence_end_date = undefined;
      newEvent.recurrence_time = undefined;

      console.log("Processed single event data:", {
        start_datetime: newEvent.start_datetime,
        end_datetime: newEvent.end_datetime,
        start_day_of_week: newEvent.start_day_of_week,
      });
    }

    console.log("Final event data:", {
      name: newEvent.name,
      location: newEvent.location,
      isRecurring: newEvent.is_recurring,
      start_datetime: newEvent.start_datetime,
      end_datetime: newEvent.end_datetime,
      recurrence_start_date: newEvent.recurrence_start_date,
      recurrence_end_date: newEvent.recurrence_end_date,
    });

    // Save event
    const savedEvent = await newEvent.save();
    console.log("Event saved successfully:", savedEvent._id);

    return res.status(201).json({
      message: "Event created successfully",
      event: savedEvent,
    });
  } catch (error) {
    console.error("Error creating event:", error);

    // Improved error handling for validation errors
    if (error.name === "ValidationError") {
      const validationErrors = {};

      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }

      return res.status(400).json({
        message: "Validation error",
        errors: validationErrors,
      });
    }

    return res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: error.stack,
    });
  }
};

/**
 * Get details of a specific event with real-time status check
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

    // Check if event has passed its end date
    const now = new Date();
    let dynamicStatus = event.status;

    if (event.status === "active") {
      if (
        event.is_recurring &&
        event.recurrence_end_date &&
        event.recurrence_end_date < now
      ) {
        dynamicStatus = "completed";

        // Optionally update the database record (can be removed if you prefer to only update via the scheduled job)
        await Event.findByIdAndUpdate(id, { status: "completed" });
      } else if (
        !event.is_recurring &&
        event.end_datetime &&
        event.end_datetime < now
      ) {
        dynamicStatus = "completed";

        // Optionally update the database record (can be removed if you prefer to only update via the scheduled job)
        await Event.findByIdAndUpdate(id, { status: "completed" });
      }
    }

    // Return event with registration count and dynamic status
    return res.status(200).json({
      ...event._doc,
      registered_count: registrationCount,
      status: dynamicStatus,
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
      "contact_person",
      "contact_email",
      "status",
      "requirements",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    // Handle max_volunteers separately to prevent registered_count from being affected
    if (req.body.max_volunteers !== undefined) {
      updateFields.max_volunteers = req.body.max_volunteers;

      // Only set registered_count if it's explicitly provided
      // DO NOT change registered_count just because max_volunteers changed
      if (req.body.registered_count !== undefined) {
        updateFields.registered_count = req.body.registered_count;
      }
    }

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
 * Sign up for an event
 */
exports.signupForEvent = async (req, res) => {
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

    // Check if event is active
    if (event.status !== "active") {
      return res
        .status(400)
        .json({ message: "Cannot sign up for an inactive event" });
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

    // Check if already signed up or was previously removed by organizer
    const existingRegistration = await EventRegistration.findOne({
      user_id: userId,
      event_id: id,
    });

    if (existingRegistration) {
      if (
        existingRegistration.status === "confirmed" ||
        existingRegistration.status === "pending"
      ) {
        return res
          .status(400)
          .json({ message: "You are already signed up for this event" });
      } else if (existingRegistration.status === "removed_by_organizer") {
        return res.status(403).json({
          message:
            "You cannot register for this event as you were previously removed by the organizer",
          wasRemoved: true,
          removalReason:
            existingRegistration.removal_reason || "Removed by event organizer",
        });
      }
    }

    // NEW CHECK FOR RECURRING EVENTS
    // If this is a recurring event, check if volunteer is already registered for any instance
    if (event.is_recurring) {
      // Find other events with the same name and organizer (likely part of the same recurring series)
      const relatedEvents = await Event.find({
        name: event.name,
        organiser_id: event.organiser_id,
        is_recurring: true,
        _id: { $ne: id } // Exclude current event
      });
      
      if (relatedEvents.length > 0) {
        const relatedEventIds = relatedEvents.map(e => e._id);
        
        // Check if volunteer is already registered for any related events
        const existingRecurringRegistration = await EventRegistration.findOne({
          user_id: userId,
          event_id: { $in: relatedEventIds },
          status: { $in: ["confirmed", "pending"] }
        });
        
        if (existingRecurringRegistration) {
          return res.status(400).json({ 
            message: "You are already signed up for another instance of this recurring event",
            isRecurring: true 
          });
        }
      }
    }

    const volunteer = await Volunteer.findOne({ user_id: userId });
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer profile not found" });
    }

    // Verify the volunteer's NRIC is verified
    if (!volunteer.nric_image.verified) {
      return res.status(403).json({
        message: "You need to verify your NRIC before signing up for events",
        requiresVerification: true,
      });
    }

    // Create new registration or update existing one if it was previously cancelled
    if (existingRegistration && existingRegistration.status === "cancelled") {
      // Update the existing registration back to confirmed
      existingRegistration.status = "confirmed";
      existingRegistration.signup_date = new Date();
      await existingRegistration.save();
    } else {
      // Create a new registration
      const registration = new EventRegistration({
        user_id: userId,
        event_id: id,
        status: "confirmed",
        signup_date: new Date(),
      });

      // Save registration
      await registration.save();
    }

    // Increment registered_count on event
    await Event.findByIdAndUpdate(id, { $inc: { registered_count: 1 } });

    return res.status(201).json({
      message: "Successfully signed up for event",
      success: true,
    });
  } catch (error) {
    console.error("Error signing up for event:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Remove signup from an event
 */
exports.removeEventSignup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { registrationId, reason } = req.body;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    let registration;
    let wasRemovalByOrganizer = false;
    let event;

    // If registrationId is provided, we're removing a specific registration (organizer action)
    if (registrationId && mongoose.Types.ObjectId.isValid(registrationId)) {
      // Verify user is organizer of the event
      const user = await User.findById(userId);
      if (!user || user.role !== "organiser") {
        return res
          .status(403)
          .json({ message: "Only organisers can remove volunteers" });
      }

      const organiser = await Organiser.findOne({ user_id: userId });
      if (!organiser) {
        return res.status(404).json({ message: "Organiser profile not found" });
      }

      event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Check if user is the event organiser
      if (event.organiser_id.toString() !== organiser._id.toString()) {
        return res.status(403).json({
          message:
            "You are not authorized to manage this event's registrations",
        });
      }

      // Find the specific registration by ID
      registration = await EventRegistration.findById(registrationId);

      // This is an organizer removing a volunteer
      wasRemovalByOrganizer = true;
    } else {
      // Otherwise, we're handling a volunteer canceling their own registration
      registration = await EventRegistration.findOne({
        user_id: userId,
        event_id: id,
      });
    }

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    // Find the event if not already retrieved (needed for volunteer self-cancellation)
    if (!event) {
      event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
    }

    // If this is an organizer removing a volunteer, mark as removed rather than deleting
    if (wasRemovalByOrganizer) {
      // Only decrease count if the registration status was active (not already removed)
      const currentStatus = registration.status;

      // Update the registration to mark it as removed by organizer with optional reason
      await EventRegistration.findByIdAndUpdate(registration._id, {
        status: "removed_by_organizer",
        removal_reason: reason || "Removed by event organizer",
      });

      // Only decrement registered_count if the registration was not already cancelled/removed
      if (currentStatus === "confirmed" || currentStatus === "pending") {
        // Update registered_count in a separate operation
        if (event && event.registered_count > 0) {
          await Event.findByIdAndUpdate(id, {
            registered_count: event.registered_count - 1,
          });
        }
      }
    } else {
      // For self-cancellation by volunteer, delete the registration as before
      await EventRegistration.findByIdAndDelete(registration._id);

      // Update registered_count if needed
      if (event && event.registered_count > 0) {
        // Update registered_count in a separate operation
        await Event.findByIdAndUpdate(id, {
          registered_count: event.registered_count - 1,
        });
      }
    }

    console.log(`Event ${id} updated, new registered count: ${event.registered_count - 1}`);

    return res.status(200).json({
      message: wasRemovalByOrganizer
        ? "Volunteer has been removed from the event"
        : "Successfully removed signup from event",
    });
  } catch (error) {
    console.error("Error removing signup:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Check if user is signed up for an event or has been removed
 */
exports.checkSignupStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    // Find registration
    const registration = await EventRegistration.findOne({
      user_id: userId,
      event_id: id,
    });

    // Build response object
    const response = {
      isSignedUp: false,
      wasRemoved: false,
      removalReason: null,
    };

    if (registration) {
      if (
        registration.status === "confirmed" ||
        registration.status === "pending"
      ) {
        response.isSignedUp = true;
      } else if (registration.status === "removed_by_organizer") {
        response.wasRemoved = true;
        response.removalReason =
          registration.removal_reason || "Removed by event organizer";
      }
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error checking signup status:", error);
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

/**
 * Get registered volunteers for an event
 *
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Event ID
 * @param {Object} req.user - Authenticated user information
 * @param {string} req.user.id - User ID
 * @param {Object} res - Express response object
 *
 * @returns {Object} JSON response with volunteers registered for the event
 * @throws {Error} If server error occurs during retrieval
 */
exports.getEventVolunteers = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(
      `Getting volunteers for event: ${id}, requested by user: ${userId}`
    );

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    // Find event by ID
    let event;
    try {
      event = await Event.findById(id);
    } catch (err) {
      console.error("Error finding event:", err);
      return res
        .status(500)
        .json({ message: "Error retrieving event", error: err.message });
    }

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Get organiser profile
    let organiser;
    try {
      organiser = await Organiser.findOne({ user_id: userId });
    } catch (err) {
      console.error("Error finding organiser:", err);
      return res.status(500).json({
        message: "Error retrieving organiser profile",
        error: err.message,
      });
    }

    if (!organiser) {
      return res.status(404).json({ message: "Organiser profile not found" });
    }

    // Check if user is the event organiser
    if (event.organiser_id.toString() !== organiser._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to view volunteers for this event",
      });
    }

    // Get registrations with volunteer details
    let registrations = [];
    try {
      // First, find all registrations for this event
      const eventRegistrations = await EventRegistration.find({ event_id: id });
      console.log(
        `Found ${eventRegistrations.length} registrations for event ${id}`
      );

      // If no registrations are found, return an empty array
      if (eventRegistrations.length === 0) {
        return res.status(200).json({ registrations: [] });
      }

      // For each registration, manually populate volunteer details
      registrations = await Promise.all(
        eventRegistrations.map(async (registration) => {
          // First get the user data
          const user = await User.findById(registration.user_id);

          // Then get the volunteer data for this user
          let volunteer = null;
          if (user && user.role === "volunteer") {
            volunteer = await Volunteer.findOne({ user_id: user._id });
          }

          // Return the registration with embedded volunteer data
          return {
            _id: registration._id,
            event_id: registration.event_id,
            status: registration.status || "confirmed",
            signup_date: registration.signup_date,
            attendance_status: registration.attendance_status,
            check_in_time: registration.check_in_time,
            check_out_time: registration.check_out_time,
            feedback: registration.feedback,
            volunteer_id: volunteer
              ? {
                  _id: volunteer._id,
                  name: volunteer.name,
                  phone: volunteer.phone,
                  dob: volunteer.dob,
                  profile_picture_url: volunteer.profile_picture_url,
                }
              : user
              ? {
                  _id: user._id,
                  name: user.email.split("@")[0], // Fallback to email name if volunteer not found
                  email: user.email,
                }
              : null,
          };
        })
      );
    } catch (err) {
      console.error("Error processing registrations:", err);
      return res.status(500).json({
        message: "Error retrieving event registrations",
        error: err.message,
      });
    }

    return res.status(200).json({ registrations });
  } catch (error) {
    console.error("Error getting event volunteers:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
