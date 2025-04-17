const User = require("../models/User");
const Event = require("../models/Event");
const Volunteer = require("../models/Volunteer");
const Organiser = require("../models/Organiser");
const EventRegistration = require("../models/EventRegistration");
const mongoose = require("mongoose");

/**
 * Get current user's event registrations
 *
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user information
 * @param {string} req.user.id - User ID
 * @param {Object} res - Express response object
 *
 * @returns {Object} JSON response with user's registrations
 * @throws {Error} If server error occurs during retrieval
 *
 * Steps:
 * 1. Get user role
 * 2. Verify user is a volunteer
 * 3. Get volunteer profile
 * 4. Get registrations with populated event details
 * 5. Return registrations
 */
exports.getUserRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "volunteer") {
      return res
        .status(403)
        .json({ message: "Only volunteers can access registrations" });
    }

    // Get volunteer profile
    const volunteer = await Volunteer.findOne({ user_id: userId });
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer profile not found" });
    }

    // Get registrations with populated event details
    const registrations = await EventRegistration.find({
      user_id: userId,
    })
      .populate({
        path: "event_id",
        populate: {
          path: "organiser_id",
          select: "name",
        },
      })
      .sort({ registration_date: -1 });

    return res.status(200).json({ registrations });
  } catch (error) {
    console.error("Error getting registrations:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Register for an event
 *
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user information
 * @param {string} req.user.id - User ID
 * @param {Object} req.body - Registration details
 * @param {string} req.body.event_id - Event ID
 * @param {Object} res - Express response object
 *
 * @returns {Object} JSON response with registration details
 * @throws {Error} If server error occurs during registration
 *
 * Steps:
 * 1. Validate event ID
 * 2. Verify user is a volunteer
 * 3. Get volunteer profile
 * 4. Find event by ID
 * 5. Check if event is active
 * 6. Check if event has reached max capacity
 * 7. Check if already registered
 * 8. Create new registration
 * 9. Start transaction
 * 10. Save registration
 * 11. Increment registered_count on event
 * 12. Commit transaction or abort on error
 * 13. Return success message with registration
 */
exports.createRegistration = async (req, res) => {
  try {
    const userId = req.user.id;
    const { event_id } = req.body;

    // Validate event ID
    if (!event_id || !mongoose.Types.ObjectId.isValid(event_id)) {
      return res.status(400).json({ message: "Valid event ID is required" });
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
    const event = await Event.findById(event_id);
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
      user_id: userId,
      event_id,
    });

    if (existingRegistration) {
      return res
        .status(400)
        .json({ message: "You are already registered for this event" });
    }

    // Create new registration
    const registration = new EventRegistration({
      user_id: userId,
      event_id,
      status: "registered",
      signup_date: new Date(),
    });

    // Save registration (without transactions)
    await registration.save();

    // Increment registered_count on event
    await Event.findByIdAndUpdate(event_id, {
      $inc: { registered_count: 1 },
    });

    return res.status(201).json({
      message: "Registered for event successfully",
      registration,
    });
  } catch (error) {
    console.error("Error creating registration:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get specific registration details
 *
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Registration ID
 * @param {Object} req.user - Authenticated user information
 * @param {string} req.user.id - User ID
 * @param {Object} res - Express response object
 *
 * @returns {Object} JSON response with registration details
 * @throws {Error} If server error occurs during retrieval
 *
 * Steps:
 * 1. Check if ID is valid
 * 2. Find registration by ID with populated details
 * 3. Check authorization based on user role
 * 4. For volunteers: verify it's their own registration
 * 5. For organisers: verify it's for their event
 * 6. Return registration details
 */
exports.getRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid registration ID" });
    }

    // Find registration by ID
    const registration = await EventRegistration.findById(id).populate({
      path: "event_id",
      populate: {
        path: "organiser_id",
        select: "name profile_picture_url",
      },
    });

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    // Check authorization
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Volunteer can view their own registrations
    if (user.role === "volunteer") {
      const volunteer = await Volunteer.findOne({ user_id: userId });
      if (
        !volunteer ||
        volunteer.user_id.toString() !== registration.user_id.toString()
      ) {
        return res.status(403).json({
          message: "Not authorized to view this registration",
        });
      }
    }
    // Organiser can view registrations for their events
    else if (user.role === "organiser") {
      const organiser = await Organiser.findOne({ user_id: userId });
      const event = await Event.findById(registration.event_id);

      if (
        !organiser ||
        !event ||
        event.organiser_id.toString() !== organiser._id.toString()
      ) {
        return res.status(403).json({
          message: "Not authorized to view this registration",
        });
      }
    }

    return res.status(200).json({ registration });
  } catch (error) {
    console.error("Error getting registration:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Update registration (e.g., add feedback)
 *
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Registration ID
 * @param {Object} req.user - Authenticated user information
 * @param {string} req.user.id - User ID
 * @param {Object} req.body - Update data
 * @param {Object} [req.body.feedback] - Feedback information
 * @param {Object} res - Express response object
 *
 * @returns {Object} JSON response with updated registration
 * @throws {Error} If server error occurs during update
 *
 * Steps:
 * 1. Check if ID is valid
 * 2. Find registration by ID
 * 3. Check authorization based on user role
 * 4. Prepare update data
 * 5. For volunteers: add volunteer feedback if provided
 * 6. For organisers: add organiser feedback if provided
 * 7. Update registration
 * 8. Return success message with updated registration
 */
exports.updateRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid registration ID" });
    }

    // Find registration
    const registration = await EventRegistration.findById(id);
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    // Update the registration with the provided data
    // Check each field if it's explicitly set to null (for reset operations)
    const updateData = {};

    // Handle check-in time reset
    if (req.body.check_in_time === null) {
      updateData.check_in_time = null;
    } else if (req.body.check_in_time) {
      updateData.check_in_time = req.body.check_in_time;
    }

    // Handle check-out time reset
    if (req.body.check_out_time === null) {
      updateData.check_out_time = null;
    } else if (req.body.check_out_time) {
      updateData.check_out_time = req.body.check_out_time;
    }

    // Handle status updates
    if (req.body.status) {
      updateData.status = req.body.status;
    }

    // Handle attendance_status updates
    if (req.body.attendance_status) {
      updateData.attendance_status = req.body.attendance_status;
    }

    // Perform the update
    const updatedRegistration = await EventRegistration.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    return res.status(200).json({
      message: "Registration updated successfully",
      registration: updatedRegistration,
    });
  } catch (error) {
    console.error("Error updating registration:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Cancel event registration
 *
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Registration ID
 * @param {Object} req.user - Authenticated user information
 * @param {string} req.user.id - User ID
 * @param {Object} res - Express response object
 *
 * @returns {Object} JSON response with cancellation status
 * @throws {Error} If server error occurs during cancellation
 *
 * Steps:
 * 1. Check if ID is valid
 * 2. Find registration by ID
 * 3. Check authorization (only volunteer who registered can cancel)
 * 4. Start transaction
 * 5. Delete registration
 * 6. Decrement registered_count on event
 * 7. Commit transaction or abort on error
 * 8. Return success message
 */
exports.cancelRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid registration ID" });
    }

    // Find registration by ID
    const registration = await EventRegistration.findById(id);
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    // Check authorization
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only volunteer who registered can cancel
    if (user.role === "volunteer") {
      const volunteer = await Volunteer.findOne({ user_id: userId });
      if (
        !volunteer ||
        volunteer.user_id.toString() !== registration.user_id.toString()
      ) {
        return res.status(403).json({
          message: "Not authorized to cancel this registration",
        });
      }
    } else {
      return res.status(403).json({
        message: "Only volunteers can cancel their registrations",
      });
    }

    // Delete registration (without transactions)
    await EventRegistration.findByIdAndDelete(id);

    // Decrement registered_count on event
    await Event.findByIdAndUpdate(registration.event_id, {
      $inc: { registered_count: -1 },
    });

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
 * Record volunteer check-in
 *
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Registration ID
 * @param {Object} req.user - Authenticated user information
 * @param {string} req.user.id - User ID
 * @param {Object} res - Express response object
 *
 * @returns {Object} JSON response with check-in status
 * @throws {Error} If server error occurs during check-in
 *
 * Steps:
 * 1. Check if ID is valid
 * 2. Find registration by ID
 * 3. Check authorization (only organizer of the event can check in volunteers)
 * 4. Update registration with check-in time and status
 * 5. Return success message with updated registration
 */
exports.checkInRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid registration ID" });
    }

    // Find registration by ID
    const registration = await EventRegistration.findById(id);
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    // Check authorization (only organizer of the event can check in volunteers)
    const user = await User.findById(userId);
    if (!user || user.role !== "organiser") {
      return res
        .status(403)
        .json({ message: "Only organizers can check in volunteers" });
    }

    const organiser = await Organiser.findOne({ user_id: userId });
    const event = await Event.findById(registration.event_id);

    if (
      !organiser ||
      !event ||
      event.organiser_id.toString() !== organiser._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to check in for this event" });
    }

    // Update registration with check-in time and status
    const updatedRegistration = await EventRegistration.findByIdAndUpdate(
      id,
      {
        $set: {
          check_in_time: new Date(),
          status: "attended",
        },
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Volunteer checked in successfully",
      registration: updatedRegistration,
    });
  } catch (error) {
    console.error("Error checking in volunteer:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Record volunteer check-out
 *
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Registration ID
 * @param {Object} req.user - Authenticated user information
 * @param {string} req.user.id - User ID
 * @param {Object} res - Express response object
 *
 * @returns {Object} JSON response with check-out status
 * @throws {Error} If server error occurs during check-out
 *
 * Steps:
 * 1. Check if ID is valid
 * 2. Find registration by ID
 * 3. Verify registration has been checked in
 * 4. Check authorization (only organizer of the event can check out volunteers)
 * 5. Update registration with check-out time
 * 6. Return success message with updated registration
 */
exports.checkOutRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid registration ID" });
    }

    // Find registration by ID
    const registration = await EventRegistration.findById(id);
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    // Verify registration has been checked in
    if (!registration.check_in_time) {
      return res.status(400).json({
        message: "Volunteer must check in before checking out",
      });
    }

    // Check authorization (only organizer of the event can check out volunteers)
    const user = await User.findById(userId);
    if (!user || user.role !== "organiser") {
      return res
        .status(403)
        .json({ message: "Only organizers can check out volunteers" });
    }

    const organiser = await Organiser.findOne({ user_id: userId });
    const event = await Event.findById(registration.event_id);

    if (
      !organiser ||
      !event ||
      event.organiser_id.toString() !== organiser._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized to check out for this event",
      });
    }

    // Update registration with check-out time
    const updatedRegistration = await EventRegistration.findByIdAndUpdate(
      id,
      {
        $set: {
          check_out_time: new Date(),
        },
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Volunteer checked out successfully",
      registration: updatedRegistration,
    });
  } catch (error) {
    console.error("Error checking out volunteer:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Add feedback to registration
 *
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Registration ID
 * @param {Object} req.user - Authenticated user information
 * @param {string} req.user.id - User ID
 * @param {Object} req.body - Feedback data
 * @param {string} req.body.comment - Feedback comment
 * @param {number} req.body.rating - Feedback rating (1-5)
 * @param {Object} res - Express response object
 *
 * @returns {Object} JSON response with feedback status
 * @throws {Error} If server error occurs during feedback submission
 *
 * Steps:
 * 1. Check if ID is valid
 * 2. Validate feedback data
 * 3. Find registration by ID
 * 4. Check authorization based on user role
 * 5. Create feedback data
 * 6. Update registration with feedback
 * 7. Return success message with updated registration
 */
exports.addFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { comment, rating } = req.body;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid registration ID" });
    }

    // Validate feedback data
    if (!comment || !rating) {
      return res
        .status(400)
        .json({ message: "Comment and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // Find registration by ID
    const registration = await EventRegistration.findById(id);
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    // Check authorization
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let updateField = "";

    // Volunteer can add feedback to their own registrations
    if (user.role === "volunteer") {
      const volunteer = await Volunteer.findOne({ user_id: userId });
      if (
        !volunteer ||
        volunteer.user_id.toString() !== registration.user_id.toString()
      ) {
        return res.status(403).json({
          message: "Not authorized to add feedback to this registration",
        });
      }

      updateField = "feedback.from_volunteer";
    }
    // Organiser can add feedback to volunteers for their events
    else if (user.role === "organiser") {
      const organiser = await Organiser.findOne({ user_id: userId });
      const event = await Event.findById(registration.event_id);

      if (
        !organiser ||
        !event ||
        event.organiser_id.toString() !== organiser._id.toString()
      ) {
        return res.status(403).json({
          message: "Not authorized to add feedback to this registration",
        });
      }

      updateField = "feedback.from_organiser";
    }

    // Create feedback data
    const feedbackData = {
      comment,
      rating,
      submitted_at: new Date(),
    };

    // Update registration with feedback
    const update = {};
    update[updateField] = feedbackData;

    const updatedRegistration = await EventRegistration.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    );

    return res.status(200).json({
      message: "Feedback added successfully",
      registration: updatedRegistration,
    });
  } catch (error) {
    console.error("Error adding feedback:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
