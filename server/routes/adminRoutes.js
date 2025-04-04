const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const {
	protectRoute,
	requireRole,
	requirePermission,
} = require("../middleware/authMiddleware");

// Apply admin role middleware to all routes
router.use(protectRoute);
router.use(requireRole("admin"));

/**
 * @route   GET /admin/dashboard
 * @desc    Get admin dashboard statistics including users, events, registrations, reports, and verifications
 * @access  Private (Admin only)
 */
router.get("/dashboard", adminController.getDashboardStats);

/**
 * @route   GET /admin/users
 * @desc    Get paginated list of all users with optional filtering by role, status, or search term
 * @access  Private (Admin with manage_users permission)
 */
router.get(
	"/users",
	requirePermission("manage_users"),
	adminController.getUsers
);

/**
 * @route   GET /admin/users/:id
 * @desc    Get detailed information for a specific user including profile, events, registrations, reports, and actions
 * @access  Private (Admin with manage_users permission)
 */
router.get(
	"/users/:id",
	requirePermission("manage_users"),
	adminController.getUserById
);

/**
 * @route   PUT /admin/users/:id/status
 * @desc    Update a user's status (active, inactive, suspended) with cascading effects on their events/registrations
 * @access  Private (Admin with manage_users permission)
 */
router.put(
	"/users/:id/status",
	requirePermission("manage_users"),
	adminController.updateUserStatus
);

/**
 * @route   GET /admin/volunteers/verifications
 * @desc    Get paginated list of volunteers with pending NRIC verification
 * @access  Private (Admin with manage_users permission)
 */
router.get(
	"/volunteers/verifications",
	requirePermission("manage_users"),
	adminController.getPendingVerifications
);

/**
 * @route   PUT /admin/volunteers/:id/verification
 * @desc    Approve or reject a volunteer's NRIC verification
 * @access  Private (Admin with manage_users permission)
 */
router.put(
	"/volunteers/:id/verification",
	requirePermission("manage_users"),
	adminController.updateVerificationStatus
);

/**
 * @route   GET /admin/reports
 * @desc    Get paginated list of all reports with optional filtering by status or reported entity type
 * @access  Private (Admin with manage_reports permission)
 */
router.get(
	"/reports",
	requirePermission("manage_reports"),
	adminController.getReports
);

/**
 * @route   GET /admin/reports/:id
 * @desc    Get detailed information for a specific report
 * @access  Private (Admin with manage_reports permission)
 */
router.get(
	"/reports/:id",
	requirePermission("manage_reports"),
	adminController.getReportById
);

/**
 * @route   PUT /admin/reports/:id
 * @desc    Update report status and take appropriate actions against reported entities
 * @access  Private (Admin with manage_reports permission)
 */
router.put(
	"/reports/:id",
	requirePermission("manage_reports"),
	adminController.updateReportStatus
);

/**
 * @route   GET /admin/actions
 * @desc    Get paginated list of admin actions with optional filtering by action type or target type
 * @access  Private (Admin with manage_reports permission)
 */
router.get(
	"/actions",
	requirePermission("manage_reports"),
	adminController.getActions
);

/**
 * @route   POST /admin/actions
 * @desc    Create a new admin action (warning, suspension, ban, or event removal) against a user or event
 * @access  Private (Admin with manage_reports permission)
 */
router.post(
	"/actions",
	requirePermission("manage_reports"),
	adminController.createAction
);

/**
 * @route   GET /admin/events/:id
 * @desc    Get detailed information for a specific event including registrations and reports
 * @access  Private (Admin with manage_events permission)
 */
router.get(
    "/events/:id",
    requirePermission("manage_events"),
    adminController.getEventById
);

module.exports = router;
