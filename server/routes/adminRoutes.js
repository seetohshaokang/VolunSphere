const express = require("express");
const router = express.Router();
const { protectRoute, isAdmin } = require("../middleware/authMiddleware");
const {
    getAllUsers,
    banUser,
    verifyOrganizer,
    getReports,
    resolveReport,
    removeEvent,
} = require("../controllers/adminController");

// Protect all admin routes
router.use(protectRoute);
router.use(isAdmin);

// User management routes
router.get("/users", getAllUsers);
router.post("/users/:id/ban", banUser);
router.post("/users/:id/verify", verifyOrganizer);

// Report management routes
router.get("/reports", getReports);
router.post("/reports/:id/resolve", resolveReport);

// Event management routes
router.delete("/events/:id", removeEvent);

module.exports = router;