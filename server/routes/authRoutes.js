const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

/**
 * @route   POST /auth/register/volunteer
 * @desc    Register a new volunteer
 * @access  Public
 */
router.post("/register/volunteer", authController.registerVolunteer);

/**
 * @route   POST /auth/register/organiser
 * @desc    Register a new organiser
 * @access  Public
 */
router.post("/register/organiser", authController.registerOrganiser);

// Keep the old endpoint temporarily for backward compatibility
router.post("/register", authController.registerUser);

/**
 * @route   POST /auth/login
 * @desc    Authenticate a user with email/password and provide a JWT access token
 * @access  Public
 */
router.post("/login", authController.loginUser);

/**
 * @route   POST /auth/logout
 * @desc    Log out a user and invalidate token (client-side implementation)
 * @access  Public
 */
router.post("/logout", authController.logoutUser);

/**
 * @route   POST /auth/reset-password
 * @desc    Request a password reset (generates reset token)
 * @access  Public
 */
router.post("/reset-password", authController.requestPasswordReset);

/**
 * @route   PUT /auth/reset-password
 * @desc    Reset password using the provided reset token
 * @access  Public
 */
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;
