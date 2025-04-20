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

router.get("/dashboard", adminController.getDashboardStats);

router.get(
  "/users",
  requirePermission("manage_users"),
  adminController.getUsers
);

router.get(
  "/users/:id",
  requirePermission("manage_users"),
  adminController.getUserById
);

router.put(
  "/users/:id/status",
  requirePermission("manage_users"),
  adminController.updateUserStatus
);

router.get(
  "/volunteers/verifications",
  requirePermission("manage_users"),
  adminController.getPendingVerifications
);

router.put(
  "/volunteers/:id/verification",
  requirePermission("manage_users"),
  adminController.updateVerificationStatus
);

router.get(
  "/reports",
  requirePermission("manage_reports"),
  adminController.getReports
);

router.get(
  "/reports/:id",
  requirePermission("manage_reports"),
  adminController.getReportById
);

router.put(
  "/reports/:id",
  requirePermission("manage_reports"),
  adminController.updateReportStatus
);

router.get(
  "/actions",
  requirePermission("manage_reports"),
  adminController.getActions
);

router.post(
  "/actions",
  requirePermission("manage_reports"),
  adminController.createAction
);

router.get("/events", adminController.getEvents);

router.get("/events/:id", adminController.getEventById);

router.put("/events/:id/status", adminController.updateEventStatus);

router.put(
  "/organisers/:id/verification",
  adminController.updateOrganiserVerification
);

module.exports = router;
