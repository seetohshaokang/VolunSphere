const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { protectRoute } = require("../middleware/authMiddleware");
const { 
	nricUploadMiddleware,
	certificationUploadMiddleware
  } = require("../middleware/documentUploadMiddleware");
const profileImageUpload = require("../middleware/profileImageUploadMiddleware");
const multer = require("multer");

// Configure multer storage for profile pictures
const storage = multer.memoryStorage();
const upload = multer({
	storage: storage,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
	fileFilter: (req, file, cb) => {
		// Accept only images
		if (file.mimetype.startsWith("image/")) {
			cb(null, true);
		} else {
			cb(new Error("Only image files are allowed"));
		}
	},
}).single("profile_picture");

/**
 * @route   GET /profile
 * @desc    Get user profile based on role
 * @access  Private
 */
router.get("/", protectRoute, profileController.fetchProfile);

/**
 * @route   PUT /profile
 * @desc    Update user profile information
 * @access  Private
 */
router.put(
	"/",
	protectRoute,
	(req, res, next) => profileImageUpload(req, res, next),
	profileController.updateProfile
);

/**
 * @route   DELETE /profile
 * @desc    Delete user profile and account
 * @access  Private
 */
router.delete("/", protectRoute, profileController.deleteProfile);

/**
 * @route   POST /profile/nric
 * @desc    Upload volunteer's NRIC image for verification
 * @access  Private (Volunteer only)
 */
router.post("/nric", protectRoute, nricUploadMiddleware, profileController.uploadNRIC);

/**
 * @route   POST /profile/certification
 * @desc    Upload organizer's charity certification for verification
 * @access  Private (Organizer only)
 */
router.post("/certification", protectRoute, certificationUploadMiddleware, profileController.uploadCertification);
/**
 * @route   GET /profile/events
 * @desc    Get events associated with user (registered or organized)
 * @access  Private
 */
router.get("/events", protectRoute, profileController.getProfileEvents);

module.exports = router;
