const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoutes");
const profileRoutes = require("./profileRoutes");
const eventRoutes = require("./eventRoutes");
const registrationRoutes = require("./registrationRoutes");
const reportRoutes = require("./reportRoutes");
const adminRoutes = require("./adminRoutes");
const certificateRoutes = require("./certificateRoutes");
const {
	errorHandler,
	notFoundHandler,
} = require("../middleware/errorMiddleware");

// Mount route handlers
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/events", eventRoutes);
router.use("/registrations", registrationRoutes);
router.use("/reports", reportRoutes);
router.use("/admin", adminRoutes);
router.use("/certificates", certificateRoutes);
// Root route
router.get("/", (req, res) => {
	res.json({
		message: "Welcome to the VolunSphere API!",
		version: "1.0.0",
		documentation: "/api-docs",
	});
});

// Apply error handling middleware - should be applied last
router.use(notFoundHandler);
router.use(errorHandler);

module.exports = router;
