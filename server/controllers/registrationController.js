const User = require("../models/User");
const Event = require("../models/Event");
const Volunteer = require("../models/Volunteer");
const Organiser = require("../models/Organiser");
const EventRegistration = require("../models/EventRegistration");
const mongoose = require("mongoose");

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
          attendance_status: "attended",
          status:
            registration.status === "removed_by_organizer"
              ? "removed_by_organizer"
              : "confirmed",
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
