const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const Organiser = require("../models/Organiser");
const Event = require("../models/Event");
const Report = require("../models/Report");
const Admin = require("../models/Admin");
const AdminAction = require("../models/AdminAction");
const EventRegistration = require("../models/EventRegistration");
const mongoose = require("mongoose");

exports.getDashboardStats = async (req, res) => {
  try {
    // Step 1: Verify user has admin permissions
    const userId = req.user.id;
    const admin = await Admin.findOne({ user_id: userId });

    if (!admin) {
      return res.status(403).json({
        message: "Access denied. Admin permissions required.",
      });
    }

    // Step 2: Gather user statistics
    const volunteerCount = await User.countDocuments({ role: "volunteer" });
    const organiserCount = await User.countDocuments({ role: "organiser" });
    const totalUsers = volunteerCount + organiserCount;

    // Step 3: Calculate new user growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({
      created_at: { $gte: thirtyDaysAgo },
    });

    // Step 4: Gather event statistics by status
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ status: "active" });
    const completedEvents = await Event.countDocuments({
      status: "completed",
    });
    const cancelledEvents = await Event.countDocuments({
      status: "cancelled",
    });

    // Step 5: Calculate registration statistics and attendance rates
    const totalRegistrations = await EventRegistration.countDocuments();
    const attendedRegistrations = await EventRegistration.countDocuments({
      status: "attended",
    });
    const noShowRegistrations = await EventRegistration.countDocuments({
      status: "no_show",
    });

    // Step 6: Gather report statistics
    const pendingReports = await Report.countDocuments({
      status: "pending",
    });
    const resolvedReports = await Report.countDocuments({
      status: { $in: ["resolved", "dismissed"] },
    });
    const underReviewReports = await Report.countDocuments({
      status: "under_review",
    });

    // Step 7: Get count of pending verification requests
    const pendingVerifications = await Volunteer.countDocuments({
      "nric_image.data": { $ne: null },
      "nric_image.verified": false,
    });

    // Step 8: Calculate most popular event causes using aggregation
    const popularCauses = await Event.aggregate([
      { $unwind: "$causes" },
      { $group: { _id: "$causes", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Step 9: Compile all statistics into a structured response object
    const stats = {
      users: {
        total: totalUsers,
        volunteers: volunteerCount,
        organisers: organiserCount,
        newUsers,
      },
      events: {
        total: totalEvents,
        active: activeEvents,
        completed: completedEvents,
        cancelled: cancelledEvents,
        popularCauses,
      },
      registrations: {
        total: totalRegistrations,
        attended: attendedRegistrations,
        noShow: noShowRegistrations,
        attendanceRate:
          totalRegistrations > 0
            ? ((attendedRegistrations / totalRegistrations) * 100).toFixed(2)
            : 0,
      },
      reports: {
        pending: pendingReports,
        resolved: resolvedReports,
        under_review: underReviewReports,
      },
      verifications: {
        pending: pendingVerifications,
      },
    };

    return res.status(200).json({ stats });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    // Step 1: Verify user has admin permissions
    const userId = req.user.id;
    const admin = await Admin.findOne({ user_id: userId });

    if (!admin) {
      return res.status(403).json({
        message: "Access denied. Admin permissions required.",
      });
    }

    // Step 2: Get and validate query parameters
    const { role, status, search, page = 1, limit = 10 } = req.query;

    // Step 3: Build filtering query
    const query = {};

    if (role && ["volunteer", "organiser"].includes(role)) {
      query.role = role;
    }

    if (status && ["active", "inactive", "suspended"].includes(status)) {
      query.status = status;
    }

    if (search) {
      query.$or = [{ email: { $regex: search, $options: "i" } }];
    }

    // Step 4: Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Step 5: Fetch users with pagination and sorting
    const users = await User.find(query)
      .select("-password")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Step 6: Count total matching users for pagination metadata
    const total = await User.countDocuments(query);

    // Step 7: Fetch profile details for each user based on their role
    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        let profile;

        if (user.role === "volunteer") {
          profile = await Volunteer.findOne({
            user_id: user._id,
          }).select(
            "name phone profile_picture_url skills preferred_causes nric_image"
          );
        } else if (user.role === "organiser") {
          profile = await Organiser.findOne({
            user_id: user._id,
          }).select(
            "name phone profile_picture_url verification_status certification_document"
          );
        }

        return {
          ...user._doc,
          profile,
        };
      })
    );

    // Step 8: Return paginated results with metadata
    return res.status(200).json({
      users: usersWithProfiles,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error getting users:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// getUserById
exports.getUserById = async (req, res) => {
  try {
    // Step 1: Verify user has admin permissions
    const userId = req.user.id;
    const admin = await Admin.findOne({ user_id: userId });

    if (!admin) {
      return res.status(403).json({
        message: "Access denied. Admin permissions required.",
      });
    }

    const { id } = req.params;

    // Step 2: Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Step 3: Get basic user information
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 4: Initialize variables for role-specific data
    let profile;
    let events = [];
    let registrations = [];
    let reports = [];

    // Step 5: Get role-specific profile and related data
    if (user.role === "volunteer") {
      profile = await Volunteer.findOne({ user_id: id });

      // Get volunteer registrations
      if (profile) {
        const volRegistrations = await EventRegistration.find({
          user_id: id,
        }).populate("event_id");

        registrations = volRegistrations;
      }
    } else if (user.role === "organiser") {
      // Added certification_document to the fields being selected for the organiser
      profile = await Organiser.findOne({ user_id: id }).select(
        "organisation_name phone profile_picture_url verification_status certification_document"
      );

      // Get organised events
      if (profile) {
        events = await Event.find({ organiser_id: profile._id });
      }
    }

    // Step 6: Get reports submitted by user
    reports = await Report.find({ reporter_id: id })
      .populate("reported_id")
      .populate("event_id");

    // Step 7: Get admin actions targeting this user
    const actions = await AdminAction.find({
      $or: [
        { target_type: "volunteer", target_id: profile?._id },
        { target_type: "organiser", target_id: profile?._id },
      ],
    }).populate("admin_id");

    // Step 8: Return comprehensive user data
    return res.status(200).json({
      user,
      profile,
      events,
      registrations,
      reports,
      actions,
    });
  } catch (error) {
    console.error("Error getting user:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    // Step 1: Verify user has admin permissions
    const adminUserId = req.user.id;
    const admin = await Admin.findOne({ user_id: adminUserId });

    if (!admin) {
      return res.status(403).json({
        message: "Access denied. Admin permissions required.",
      });
    }

    const { id } = req.params;
    const { status, reason } = req.body;

    // Step 2: Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Step 3: Validate status
    if (!status || !["active", "inactive", "suspended"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be active, inactive, or suspended.",
      });
    }

    // Step 4: Get user and verify existence
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 5: Get profile based on user role
    let profile;
    if (user.role === "volunteer") {
      profile = await Volunteer.findOne({ user_id: id });
    } else if (user.role === "organiser") {
      profile = await Organiser.findOne({ user_id: id });
    }

    if (!profile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    // Step 6: Update user status
    user.status = status;
    await user.save();

    // Step 7: Create admin action record for audit trail
    const action = new AdminAction({
      admin_id: admin._id,
      action:
        status === "suspended"
          ? "suspension"
          : status === "active"
          ? "activation"
          : "deactivation",
      target_type: user.role,
      target_id: profile._id,
      reason: reason || `User ${status} by admin`,
      date: new Date(),
    });
    await action.save();

    // Step 8: Handle side effects based on status change
    if (status === "suspended" && user.role === "volunteer") {
      await EventRegistration.updateMany(
        { user_id: id, status: "registered" },
        { $set: { status: "cancelled" } }
      );
    }

    if (status === "suspended" && user.role === "organiser") {
      await Event.updateMany(
        { organiser_id: profile._id, status: "active" },
        { $set: { status: "cancelled" } }
      );
    }

    return res.status(200).json({
      message: `User status updated to ${status}`,
      user: { ...user.toObject(), status },
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getPendingVerifications = async (req, res) => {
  try {
    // Step 1: Verify user has admin permissions
    const userId = req.user.id;
    const admin = await Admin.findOne({ user_id: userId });

    if (!admin) {
      return res.status(403).json({
        message: "Access denied. Admin permissions required.",
      });
    }

    // Step 2: Get pagination parameters
    const { page = 1, limit = 10 } = req.query;

    // Step 3: Calculate pagination offsets
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Step 4: Find volunteers with unverified NRIC images
    // Filter to only those with uploaded but unverified NRIC data
    const volunteers = await Volunteer.find({
      "nric_image.data": { $ne: null },
      "nric_image.verified": false,
    })
      .select("user_id name phone nric_image.uploaded_at")
      .sort({ "nric_image.uploaded_at": -1 }) // Sort by most recent uploads first
      .skip(skip)
      .limit(parseInt(limit))
      .populate("user_id", "email status created_at"); // Include user data

    // Step 5: Count total matching volunteers for pagination metadata
    const total = await Volunteer.countDocuments({
      "nric_image.data": { $ne: null },
      "nric_image.verified": false,
    });

    // Step 6: Return paginated results with metadata
    return res.status(200).json({
      volunteers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error getting pending verifications:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.updateVerificationStatus = async (req, res) => {
  try {
    // Step 1: Verify user has admin permissions
    const adminUserId = req.user.id;
    const admin = await Admin.findOne({ user_id: adminUserId });

    if (!admin) {
      return res.status(403).json({
        message: "Access denied. Admin permissions required.",
      });
    }

    const { id } = req.params;
    const { verified, reason } = req.body;

    // Step 2: Validate volunteer ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid volunteer ID" });
    }

    // Step 3: Validate verification status parameter
    if (typeof verified !== "boolean") {
      return res
        .status(400)
        .json({ message: "Verified status must be a boolean" });
    }

    // Step 4: Get volunteer and verify existence
    const volunteer = await Volunteer.findById(id);

    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    // Step 5: Check if volunteer has an NRIC image to verify
    // UPDATED: Check for existence of nric_image object OR filename
    // instead of requiring the data field
    if (
      !volunteer.nric_image ||
      (!volunteer.nric_image.data && !volunteer.nric_image.filename)
    ) {
      return res
        .status(400)
        .json({ message: "Volunteer does not have an NRIC image" });
    }

    // Step 6: Initialize nric_image object if it doesn't exist properly
    if (!volunteer.nric_image) {
      volunteer.nric_image = {};
    }

    // Update verification status
    volunteer.nric_image.verified = verified;

    // If rejecting, add rejection reason and flag for re-upload
    if (!verified) {
      volunteer.nric_image.rejection_reason =
        reason || "NRIC verification rejected by admin";
      volunteer.nric_image.requires_reupload = true;
    } else {
      // Clear rejection reason and re-upload flag if approving
      volunteer.nric_image.rejection_reason = null;
      volunteer.nric_image.requires_reupload = false;
    }

    await volunteer.save();

    // Step 7: Create admin action record for audit trail
    const action = new AdminAction({
      admin_id: admin._id,
      action: verified ? "verification_approved" : "verification_rejected",
      target_type: "volunteer",
      target_id: volunteer._id,
      reason:
        reason ||
        `NRIC verification ${verified ? "approved" : "rejected"} by admin`,
      date: new Date(),
    });
    await action.save();

    // Step 8: Update admin's reports_handled count
    admin.reports_handled += 1;
    await admin.save();

    // Step 9: Respond with success
    return res.status(200).json({
      message: `NRIC verification ${verified ? "approved" : "rejected"}`,
      volunteer: {
        _id: volunteer._id,
        name: volunteer.name,
        nric_verified: volunteer.nric_image.verified,
        nric_rejection_reason: volunteer.nric_image.rejection_reason,
      },
    });
  } catch (error) {
    console.error("Error updating verification status:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getReports = async (req, res) => {
  try {
    // Step 1: Verify user has admin permissions
    const userId = req.user.id;
    const admin = await Admin.findOne({ user_id: userId });

    if (!admin) {
      return res.status(403).json({
        message: "Access denied. Admin permissions required.",
      });
    }

    // Step 2: Get and validate query parameters
    const { status, reported_type, page = 1, limit = 10 } = req.query;

    // Step 3: Build filtering query
    const query = {};

    if (
      status &&
      ["pending", "under_review", "resolved", "dismissed"].includes(status)
    ) {
      query.status = status;
    }

    if (
      reported_type &&
      ["Volunteer", "Organiser", "Event"].includes(reported_type)
    ) {
      query.reported_type = reported_type;
    }

    // Step 4: Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Step 5: Fetch reports with pagination, sorting, and populated references
    const reports = await Report.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("reporter_id", "email")
      .populate("reported_id")
      .populate("event_id");

    // Step 6: Count total matching reports for pagination metadata
    const total = await Report.countDocuments(query);

    // Step 7: Return paginated results with metadata
    return res.status(200).json({
      reports,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error getting reports:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getReportById = async (req, res) => {
  try {
    // Step 1: Verify user has admin permissions
    const userId = req.user.id;
    const admin = await Admin.findOne({ user_id: userId });

    if (!admin) {
      return res.status(403).json({
        message: "Access denied. Admin permissions required.",
      });
    }

    const { id } = req.params;

    // Step 2: Validate report ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    // Step 3: Fetch report with populated references
    const report = await Report.findById(id)
      .populate("reporter_id", "email")
      .populate("reported_id")
      .populate("event_id")
      .populate("resolved_by");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Step 4: Return complete report data
    return res.status(200).json({ report });
  } catch (error) {
    console.error("Error getting report:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    // Step 1: Verify user has admin permissions
    const adminUserId = req.user.id;
    const admin = await Admin.findOne({ user_id: adminUserId });

    if (!admin) {
      return res.status(403).json({
        message: "Access denied. Admin permissions required.",
      });
    }

    const { id } = req.params;
    const { status, admin_notes, resolution_action } = req.body;

    // Step 2: Validate report ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    // Step 3: Validate status
    if (
      !status ||
      !["pending", "under_review", "resolved", "dismissed"].includes(status)
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Step 4: Get report and verify existence
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Step 5: Validate resolution action if status is "resolved"
    if (
      status === "resolved" &&
      (!resolution_action ||
        !["none", "warning", "suspension", "ban", "event_removed"].includes(
          resolution_action
        ))
    ) {
      return res.status(400).json({ message: "Invalid resolution action" });
    }

    // Step 6: Update report fields (without transaction)
    report.status = status;

    if (admin_notes) {
      report.admin_notes = admin_notes;
    }

    if (status === "resolved" || status === "dismissed") {
      report.resolved_by = admin._id;
      report.resolution_date = new Date();
      report.resolution_action = resolution_action || "none";
    }

    await report.save();

    // Step 7: Take action based on resolution (if status is "resolved" and action specified)
    if (
      status === "resolved" &&
      resolution_action &&
      resolution_action !== "none"
    ) {
      const targetType = report.reported_type.toLowerCase();
      // Step 7.1: Create admin action record for audit trail
      const action = new AdminAction({
        admin_id: admin._id,
        action: resolution_action,
        target_type: targetType,
        target_id: report.reported_id,
        reason: admin_notes || `Action taken based on report #${report._id}`,
        date: new Date(),
        related_report_id: report._id,
      });

      await action.save();

      // Step 7.2: Execute specific action based on type (without transaction)
      if (resolution_action === "suspension" || resolution_action === "ban") {
        // Get the user associated with the reported entity
        let userToUpdate;

        if (report.reported_type === "Volunteer") {
          const volunteer = await Volunteer.findById(report.reported_id);
          if (volunteer) {
            userToUpdate = await User.findById(volunteer.user_id);
          }
        } else if (report.reported_type === "Organiser") {
          const organiser = await Organiser.findById(report.reported_id);
          if (organiser) {
            userToUpdate = await User.findById(organiser.user_id);
          }
        }

        // Update user status based on action
        if (userToUpdate) {
          userToUpdate.status =
            resolution_action === "ban" ? "inactive" : "suspended";
          await userToUpdate.save();
        }
      } else if (
        resolution_action === "event_removed" &&
        report.reported_type === "Event"
      ) {
        // Cancel the reported event
        await Event.findByIdAndUpdate(report.reported_id, {
          $set: { status: "cancelled" },
        });
      }
    }

    // Step 8: Increment admin's reports_handled count
    admin.reports_handled += 1;
    await admin.save();

    // Get the updated report with populated fields to return
    const updatedReport = await Report.findById(id)
      .populate("reporter_id", "email")
      .populate("reported_id")
      .populate("event_id")
      .populate("resolved_by");

    return res.status(200).json({
      message: `Report status updated to ${status}`,
      report: updatedReport,
    });
  } catch (error) {
    console.error("Error updating report status:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getActions = async (req, res) => {
  try {
    // Step 1: Verify user has admin permissions
    const userId = req.user.id;
    const admin = await Admin.findOne({ user_id: userId });

    if (!admin) {
      return res.status(403).json({
        message: "Access denied. Admin permissions required.",
      });
    }

    // Step 2: Get and validate query parameters
    const { action_type, target_type, page = 1, limit = 10 } = req.query;

    // Step 3: Build filtering query
    const query = {};

    if (
      action_type &&
      [
        "warning",
        "suspension",
        "ban",
        "event_removed",
        "verification_approved",
        "verification_rejected",
      ].includes(action_type)
    ) {
      query.action = action_type;
    }

    if (
      target_type &&
      ["volunteer", "organiser", "event"].includes(target_type)
    ) {
      query.target_type = target_type;
    }

    // Step 4: Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Step 5: Fetch admin actions with pagination, sorting, and populated references
    const actions = await AdminAction.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("admin_id")
      .populate("target_id")
      .populate("related_report_id");

    // Step 6: Count total matching actions for pagination metadata
    const total = await AdminAction.countDocuments(query);

    // Step 7: Return paginated results with metadata
    return res.status(200).json({
      actions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error getting admin actions:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.createAction = async (req, res) => {
  try {
    // Step 1: Verify user has admin permissions
    const adminUserId = req.user.id;
    const admin = await Admin.findOne({ user_id: adminUserId });

    if (!admin) {
      return res.status(403).json({
        message: "Access denied. Admin permissions required.",
      });
    }

    const { action, target_type, target_id, reason, related_report_id } =
      req.body;

    // Step 2: Validate required fields
    if (!action || !target_type || !target_id || !reason) {
      return res.status(400).json({
        message: "Action, target type, target ID, and reason are required",
      });
    }

    // Step 3: Validate action type
    if (!["warning", "suspension", "ban", "event_removed"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    // Step 4: Validate target type
    if (!["volunteer", "organiser", "event"].includes(target_type)) {
      return res.status(400).json({ message: "Invalid target type" });
    }

    // Step 5: Validate target ID format
    if (!mongoose.Types.ObjectId.isValid(target_id)) {
      return res.status(400).json({ message: "Invalid target ID" });
    }

    // Step 6: Validate related report ID format if provided
    if (
      related_report_id &&
      !mongoose.Types.ObjectId.isValid(related_report_id)
    ) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    // Step 7: Verify target entity exists
    let target;
    if (target_type === "volunteer") {
      target = await Volunteer.findById(target_id);
    } else if (target_type === "organiser") {
      target = await Organiser.findById(target_id);
    } else if (target_type === "event") {
      target = await Event.findById(target_id);
    }

    if (!target) {
      return res.status(404).json({ message: `${target_type} not found` });
    }

    // Step 8: Start a MongoDB transaction to ensure data consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Step 9: Create admin action record
      const adminAction = new AdminAction({
        admin_id: admin._id,
        action,
        target_type,
        target_id,
        reason,
        date: new Date(),
        related_report_id: related_report_id || null,
      });

      await adminAction.save({ session });

      // Step 10: Execute action based on type
      if (action === "suspension" || action === "ban") {
        // Step 10.1: Get the user associated with the target
        let userToUpdate;

        if (target_type === "volunteer") {
          userToUpdate = await User.findById(target.user_id).session(session);
        } else if (target_type === "organiser") {
          userToUpdate = await User.findById(target.user_id).session(session);
        }

        // Step 10.2: Update user status based on action
        if (userToUpdate) {
          userToUpdate.status = action === "ban" ? "inactive" : "suspended";
          await userToUpdate.save({ session });
        }
      } else if (action === "event_removed" && target_type === "event") {
        // Step 10.3: Cancel the event
        await Event.findByIdAndUpdate(
          target_id,
          { $set: { status: "cancelled" } },
          { session }
        );
      }

      // Step 11: Update related report if provided
      if (related_report_id) {
        await Report.findByIdAndUpdate(
          related_report_id,
          {
            $set: {
              status: "resolved",
              resolved_by: admin._id,
              resolution_date: new Date(),
              resolution_action: action,
            },
          },
          { session }
        );
      }

      // Step 12: Commit the transaction
      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        message: "Admin action created successfully",
        action: adminAction,
      });
    } catch (error) {
      // Roll back transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error creating admin action:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate event ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    // Get event with organiser details
    const event = await Event.findById(id).populate({
      path: "organiser_id",
      select:
        "organisation_name description profile_picture_url phone verification_status",
      populate: {
        path: "user_id",
        select: "email status created_at",
      },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Get registrations for this event
    const basicRegistrations = await EventRegistration.find({ event_id: id })
      .populate("user_id", "email _id")
      .sort({ registration_date: -1 });

    // Process registrations to include volunteer information
    const registrations = await Promise.all(
      basicRegistrations.map(async (reg) => {
        // Find the volunteer profile for this user
        const volunteer = await Volunteer.findOne({
          user_id: reg.user_id._id,
        }).select("name phone dob profile_picture_url");

        // Return enhanced registration object with volunteer details
        return {
          ...reg.toObject(),
          volunteer_data: volunteer,
        };
      })
    );

    // Get reports related to this event
    const reports = await Report.find({
      $or: [{ reported_type: "Event", reported_id: id }, { event_id: id }],
    }).populate("reporter_id", "email");

    // Return event data
    return res.status(200).json({
      event,
      registrations,
      reports,
    });
  } catch (error) {
    console.error("Error getting event:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//Update event status

exports.updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    // Validate status
    if (
      !status ||
      !["active", "cancelled", "completed", "draft"].includes(status)
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find event
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Update event status
    event.status = status;
    await event.save();

    // Create admin action record
    const admin = await Admin.findOne({ user_id: req.user.id });

    if (admin) {
      const action = new AdminAction({
        admin_id: admin._id,
        action: status === "cancelled" ? "event_removed" : "status_change",
        target_type: "event",
        target_id: event._id,
        reason: reason || `Event ${status} by admin`,
        date: new Date(),
      });

      await action.save();
    }

    return res.status(200).json({
      message: "Event status updated successfully",
      event,
    });
  } catch (error) {
    console.error("Error updating event status:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
//Get events for admin view with filters and pagination

exports.getEvents = async (req, res) => {
  try {
    // Extract query parameters
    const { status, cause, search, page = 1, limit = 10 } = req.query;

    // Build query
    let query = {};

    // Add status filter
    if (status) {
      query.status = status;
    }

    // Add cause filter
    if (cause) {
      query.causes = { $in: [cause] };
    }

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find events
    const events = await Event.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "organiser_id",
        select: "organisation_name phone verification_status user_id",
        populate: {
          path: "user_id",
          select: "email",
        },
      });

    // Count total matching events
    const total = await Event.countDocuments(query);

    // Return events with pagination info
    return res.status(200).json({
      events,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
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

//Update organiser verification status

exports.updateOrganiserVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    // Validate organiser ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid organiser ID" });
    }

    // Validate status
    if (!status || !["verified", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid verification status" });
    }

    // Find organiser
    const organiser = await Organiser.findById(id);
    if (!organiser) {
      return res.status(404).json({ message: "Organiser not found" });
    }

    // Update verification status
    organiser.verification_status = status;

    // If rejected, update the certification document information
    if (status === "rejected" && organiser.certification_document) {
      organiser.certification_document.verified = false;
      organiser.certification_document.rejection_reason =
        reason || "Certification document rejected";
      organiser.certification_document.requires_reupload = true;
    }

    await organiser.save();

    // Create admin action record
    const admin = await Admin.findOne({ user_id: req.user.id });

    if (admin) {
      const action = new AdminAction({
        admin_id: admin._id,
        action:
          status === "verified"
            ? "verification_approved"
            : "verification_rejected",
        target_type: "organiser",
        target_id: organiser._id,
        reason: reason || `Organisation verification ${status} by admin`,
        date: new Date(),
      });

      await action.save();
    }

    return res.status(200).json({
      message: `Organisation verification status updated to ${status}`,
      organiser,
    });
  } catch (error) {
    console.error("Error updating organiser verification:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
