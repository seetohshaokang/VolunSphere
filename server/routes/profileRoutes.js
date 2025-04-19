const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { protectRoute } = require("../middleware/authMiddleware");
const {
  nricUploadMiddleware,
  certificationUploadMiddleware,
} = require("../middleware/documentUploadMiddleware");
const profileImageUpload = require("../middleware/profileImageUploadMiddleware");
const multer = require("multer");
const mongoose = require("mongoose");
const Organiser = require("../models/Organiser");

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
router.post(
  "/nric",
  protectRoute,
  nricUploadMiddleware,
  profileController.uploadNRIC
);

/**
 * @route   POST /profile/certification
 * @desc    Upload organizer's charity certification for verification
 * @access  Private (Organizer only)
 */
router.post(
  "/certification",
  protectRoute,
  certificationUploadMiddleware,
  profileController.uploadCertification
);
/**
 * @route   GET /profile/events
 * @desc    Get events associated with user (registered or organized)
 * @access  Private
 */
router.get("/events", protectRoute, profileController.getProfileEvents);

// Add this to your profileRoutes.js file

/**
 * @route   GET /profile/organizer/:id
 * @desc    Get organizer profile by ID (public)
 * @access  Public
 */
router.get("/organizer/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate organizer ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid organizer ID format" });
    }

    // Find organizer by ID
    const organizer = await Organiser.findById(id).select(
      "name phone description address profile_picture_url website verification_status"
    );

    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    // Return public organizer data
    return res.status(200).json({
      name: organizer.name,
      phone: organizer.phone,
      description: organizer.description,
      address: organizer.address,
      profile_picture_url: organizer.profile_picture_url,
      website: organizer.website,
      verification_status: organizer.verification_status,
    });
  } catch (error) {
    console.error("Error fetching organizer profile:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
