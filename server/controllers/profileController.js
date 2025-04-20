const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const Organiser = require("../models/Organiser");
const Admin = require("../models/Admin");
const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const mongoose = require("mongoose");
const fs = require("fs");

exports.fetchProfile = async (req, res) => {
  try {
    console.log(" fetchProfile called - debugging info:");

    // Debug req.user object
    console.log(
      " req.user:",
      req.user ? JSON.stringify(req.user) : "undefined"
    );

    // Verify we have a user ID
    const userId = req.user ? req.user.id : null;
    console.log(" Extracted userId:", userId);

    if (!userId) {
      console.log(" Error: No user ID found in request");
      return res
        .status(401)
        .json({ message: "User not authenticated or ID missing" });
    }

    // Get basic user info
    console.log(" Attempting to find user with ID:", userId);
    const user = await User.findById(userId).select("-password");

    // Debug user retrieval
    if (!user) {
      console.log(" Error: User not found in database with ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(" User found:", {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    // Get role-specific profile
    let profile;
    console.log(" User role:", user.role);

    if (user.role === "volunteer") {
      console.log(" Attempting to find volunteer profile for user_id:", userId);
      profile = await Volunteer.findOne({ user_id: userId });
      console.log(
        " Volunteer findOne query result:",
        profile ? "Found" : "Not found"
      );
    } else if (user.role === "organiser") {
      console.log(" Attempting to find organiser profile for user_id:", userId);
      profile = await Organiser.findOne({ user_id: userId });
      console.log(
        " Organiser findOne query result:",
        profile ? "Found" : "Not found"
      );
    } else if (user.role === "admin") {
      console.log(" Attempting to find admin profile for user_id:", userId);
      profile = await Admin.findOne({ user_id: userId });
      console.log(
        " Admin findOne query result:",
        profile ? "Found" : "Not found"
      );
    } else {
      console.log(" Error: Unknown user role:", user.role);
    }

    if (!profile) {
      console.log(" Error: Profile not found for user ID:", userId);
      return res.status(404).json({ message: "Profile not found" });
    }

    console.log(" Profile found for user");
    console.log(" Profile Picture URL:", profile.profile_picture_url);

    // Return combined user and profile data
    const responseData = {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        last_login: user.last_login,
      },
      profile,
    };

    console.log(" Sending profile response");
    return res.status(200).json(responseData);
  } catch (error) {
    console.error(" Error fetching profile:", error);
    console.error(" Stack trace:", error.stack);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(" updateProfile called for userId:", userId);
    console.log(" Request body:", req.body);
    console.log(" Request file:", req.file ? "File uploaded" : "No file");

    // Get existing user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle profile image upload
    let profileImageUrl = null;
    if (req.file) {
      console.log(" Profile image uploaded:", req.file.filename);
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      profileImageUrl = `${baseUrl}/uploads/profiles/${req.file.filename}`;
      console.log(" Generated profile image URL:", profileImageUrl);
    }

    // Initialize profile variable
    let profile;
    if (user.role === "volunteer") {
      profile = await Volunteer.findOne({ user_id: userId });
      if (!profile)
        return res.status(404).json({ message: "Volunteer profile not found" });

      // Update fields dynamically
      const fieldsToUpdate = ["name", "phone", "bio", "address", "dob"];
      fieldsToUpdate.forEach((field) => {
        if (req.body[field]) profile[field] = req.body[field];
      });

      // Validate and update date of birth
      if (req.body.dob) {
        const parsedDate = new Date(req.body.dob);
        if (!isNaN(parsedDate)) profile.dob = parsedDate;
      }

      // Handle profile picture
      if (profileImageUrl) {
        profile.profile_picture_url = req.file.filename; // Store just the filename
        console.log(
          " Updated volunteer profile_picture_url to:",
          req.file.filename
        );
      }

      // Parse JSON safely for arrays
      try {
        if (req.body.skills) {
          profile.skills =
            typeof req.body.skills === "string"
              ? JSON.parse(req.body.skills)
              : req.body.skills;
        }
        if (req.body.preferred_causes) {
          profile.preferred_causes =
            typeof req.body.preferred_causes === "string"
              ? JSON.parse(req.body.preferred_causes)
              : req.body.preferred_causes;
        }
      } catch (error) {
        return res.status(400).json({
          message: "Invalid JSON format for skills or preferred_causes",
        });
      }
    } else if (user.role === "organiser") {
      profile = await Organiser.findOne({ user_id: userId });
      if (!profile)
        return res.status(404).json({ message: "Organiser profile not found" });

      // Update fields dynamically
      const fieldsToUpdate = [
        "name",
        "phone",
        "description",
        "address",
        "website",
      ];
      fieldsToUpdate.forEach((field) => {
        if (req.body[field]) profile[field] = req.body[field];
      });

      // Handle profile picture - store just the filename
      if (profileImageUrl) {
        profile.profile_picture_url = req.file.filename; // Store just the filename
        console.log(
          " Updated organiser profile_picture_url to:",
          req.file.filename
        );
      }
    }

    // Save updates
    const savedProfile = await profile.save();
    console.log(" Profile updated successfully");

    // Prepare the response
    // Add the full URL for the frontend
    const responseProfile = savedProfile.toObject();
    if (responseProfile.profile_picture_url) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      console.log(" Base URL for response:", baseUrl);
      // Keep the URL structure consistent
      console.log(
        " Profile picture in response:",
        responseProfile.profile_picture_url
      );
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      profile: responseProfile,
    });
  } catch (error) {
    console.error(" Error updating profile:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get existing user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete profile based on role (without transactions)
    if (user.role === "volunteer") {
      // Delete volunteer profile
      const volunteer = await Volunteer.findOneAndDelete({
        user_id: userId,
      });

      // Delete event registrations
      await EventRegistration.deleteMany({ user_id: userId });
    } else if (user.role === "organiser") {
      // Delete organiser profile
      const organiser = await Organiser.findOneAndDelete({
        user_id: userId,
      });

      // Find organiser's events
      const events = await Event.find({ organiser_id: organiser._id });

      // Delete event registrations for each event
      for (const event of events) {
        await EventRegistration.deleteMany({ event_id: event._id });
      }

      // Delete events
      await Event.deleteMany({ organiser_id: organiser._id });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    return res
      .status(200)
      .json({ message: "Profile and account deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.uploadNRIC = async (req, res) => {
  try {
    // Verify user is a volunteer
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || user.role !== "volunteer") {
      return res.status(403).json({
        message: "Access denied. Only volunteers can upload NRIC images.",
      });
    }

    // Volunteer profile lookup
    const volunteer = await Volunteer.findOne({ user_id: userId });
    if (!volunteer) {
      return res.status(404).json({
        message: "Volunteer profile not found.",
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded. Please select an image.",
      });
    }

    // Get file details
    const { filename, mimetype } = req.file;

    // Check if previous NRIC image exists
    const wasRejected =
      volunteer.nric_image && volunteer.nric_image.status === "rejected";

    // Update volunteer document with NRIC image details
    volunteer.nric_image = {
      filename,
      contentType: mimetype,
      uploaded_at: new Date(),
      status: "pending",
      verified: false,
      requires_reupload: false,
      rejection_reason: null,
    };

    await volunteer.save();

    return res.status(200).json({
      message: wasRejected
        ? "New NRIC image uploaded successfully. It will be reviewed by an administrator."
        : "NRIC image uploaded successfully. It will be verified by an administrator.",
      nric_image: {
        filename,
        uploaded_at: volunteer.nric_image.uploaded_at,
        verified: false,
        status: "pending",
      },
    });
  } catch (error) {
    console.error("Error uploading NRIC:", error);
    return res.status(500).json({
      message: "Server error while uploading NRIC",
      error: error.message,
    });
  }
};

exports.uploadCertification = async (req, res) => {
  try {
    // Verify user is an organizer
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || user.role !== "organiser") {
      return res.status(403).json({
        message:
          "Access denied. Only organisers can upload certification documents.",
      });
    }

    // Organiser profile lookup
    const organiser = await Organiser.findOne({ user_id: userId });
    if (!organiser) {
      return res.status(404).json({
        message: "Organiser profile not found.",
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded. Please select a document.",
      });
    }

    // Get file details
    const { filename, mimetype } = req.file;

    // Check if previous certification document exists and its status
    const wasRejected =
      organiser.verification_status === "rejected" ||
      (organiser.certification_document &&
        organiser.certification_document.requires_reupload);

    // Update organiser document with certification details
    organiser.certification_document = {
      filename,
      contentType: mimetype,
      uploaded_at: new Date(),
      verified: false,
      requires_reupload: false,
      rejection_reason: null,
    };

    // Also update the overall verification status
    organiser.verification_status = "pending";

    await organiser.save();

    return res.status(200).json({
      message: wasRejected
        ? "New certification document uploaded successfully. It will be reviewed by an administrator."
        : "Certification document uploaded successfully. It will be verified by an administrator.",
      certification_document: {
        filename,
        uploaded_at: organiser.certification_document.uploaded_at,
        verified: false,
        status: "pending",
      },
    });
  } catch (error) {
    console.error("Error uploading certification:", error);
    return res.status(500).json({
      message: "Server error while uploading certification document",
      error: error.message,
    });
  }
};

exports.getProfileEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(" getProfileEvents called for userId:", userId);

    // Get user role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let events = [];

    if (user.role === "volunteer") {
      // Get volunteer profile
      const volunteer = await Volunteer.findOne({ user_id: userId });
      if (!volunteer) {
        return res.status(404).json({ message: "Volunteer profile not found" });
      }

      console.log(" Volunteer found:", volunteer._id);

      // Get registered events using user_id and populate both even and organiser details
      const registrations = await EventRegistration.find({
        user_id: userId,
      }).populate({
        path: "event_id",
        populate: {
          path: "organiser_id",
          select: "name profile_picture_url verification_status",
        },
      });

      console.log(" Registrations found:", registrations.length);

      // Filter out any registrations with null event_id
      const validRegistrations = registrations.filter((reg) => reg.event_id);
      console.log(
        " Valid registrations with event data:",
        validRegistrations.length
      );

      events = validRegistrations
        .map((reg) => {
          // Ensure we have event_id data before accessing _doc
          if (!reg.event_id || !reg.event_id._doc) {
            console.log(" Missing event data for registration:", reg._id);
            return null;
          }

          const eventData = reg.event_id._doc;
          const organizerData =
            eventData.organiser_id && eventData.organiser_id._doc
              ? eventData.organiser_id._doc
              : null;

          return {
            ...eventData,
            registration_status: reg.status,
            registration_date: reg.signup_date || reg.registration_date,
            organizer: organizerData
              ? {
                  id: organizerData._id,
                  name: organizerData.name,
                  profile_picture_url: organizerData.profile_picture_url,
                  verification_status: organizerData.verification_status,
                }
              : {
                  name: "Unknown Organizer",
                },
          };
        })
        .filter(Boolean); // Remove null entries
    } else if (user.role === "organiser") {
      // Get organiser profile
      const organiser = await Organiser.findOne({ user_id: userId });
      if (!organiser) {
        return res.status(404).json({ message: "Organiser profile not found" });
      }
      // Get organized events
      events = await Event.find({ organiser_id: organiser._id });
    }

    console.log(` Found ${events.length} events for user`);
    return res.status(200).json({ events });
  } catch (error) {
    console.error(" Error getting profile events:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
