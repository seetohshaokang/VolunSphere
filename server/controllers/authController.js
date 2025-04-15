const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const Organiser = require("../models/Organiser");
const Admin = require("../models/Admin");

/**
 * Register a new volunteer
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - Volunteer's email
 * @param {string} req.body.password - Volunteer's password
 * @param {string} req.body.confirmPassword - Password confirmation
 * @param {string} req.body.name - Volunteer's name (optional, default provided)
 * @param {string} req.body.phone - Volunteer's phone (optional, default provided)
 * @param {Object} res - Express response object
 *
 * @returns {Object} JSON response with registration status
 * @throws {Error} If server error occurs during registration
 */
exports.registerVolunteer = async (req, res) => {
	try {
		console.log("registerVolunteer called with data:", {
			email: req.body.email,
			// Don't log the actual password for security
			passwordProvided: !!req.body.password,
			confirmPasswordProvided: !!req.body.confirmPassword,
			name: req.body.name,
			phone: req.body.phone,
		});

		const { email, password, confirmPassword, name, phone } = req.body;

		// Validate input
		if (!email || !password || !confirmPassword) {
			console.log("❌ Validation error: Missing required fields");
			return res.status(400).json({ message: "All fields are required" });
		}

		if (password !== confirmPassword) {
			console.log("❌ Validation error: Passwords do not match");
			return res.status(400).json({ message: "Passwords do not match" });
		}

		// Check if email already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			console.log("❌ Email already exists in database");
			return res.status(400).json({ message: "Email already in use" });
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Create user
		const newUser = new User({
			email,
			password: hashedPassword,
			role: "volunteer",
			status: "active",
			created_at: new Date(),
		});

		const savedUser = await newUser.save();
		console.log("✅ User saved with ID:", savedUser._id);

		// Create volunteer profile
		const volunteer = new Volunteer({
			user_id: savedUser._id,
			name: name || "New Volunteer", // Default value if not provided
			phone: phone || "Not provided", // Default value if not provided
			dob: new Date(),
			nric_image: {
				data: null,
				contentType: null,
				verified: false,
			},
			skills: [],
			preferred_causes: [],
		});

		await volunteer.save();
		console.log("✅ Volunteer profile saved successfully");

		return res.status(201).json({
			message: "Volunteer registration successful, please login",
		});
	} catch (error) {
		console.error("Error registering volunteer:", error);
		return res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
};

/**
 * Register a new organiser
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - Organiser's email
 * @param {string} req.body.password - Organiser's password
 * @param {string} req.body.confirmPassword - Password confirmation
 * @param {string} req.body.name - Organisation name (optional, default provided)
 * @param {string} req.body.phone - Organiser's phone (optional, default provided)
 * @param {Object} res - Express response object
 *
 * @returns {Object} JSON response with registration status
 * @throws {Error} If server error occurs during registration
 */
exports.registerOrganiser = async (req, res) => {
	try {
		console.log(" registerOrganiser called with data:", {
			email: req.body.email,
			// Don't log the actual password for security
			passwordProvided: !!req.body.password,
			confirmPasswordProvided: !!req.body.confirmPassword,
			name: req.body.name,
			phone: req.body.phone,
		});

		const { email, password, confirmPassword, name, phone } = req.body;

		// Validate input
		if (!email || !password || !confirmPassword) {
			console.log("❌ Validation error: Missing required fields");
			return res.status(400).json({ message: "All fields are required" });
		}

		if (password !== confirmPassword) {
			console.log("❌ Validation error: Passwords do not match");
			return res.status(400).json({ message: "Passwords do not match" });
		}

		// Check if email already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "Email already in use" });
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Create user
		const newUser = new User({
			email,
			password: hashedPassword,
			role: "organiser",
			status: "active",
			created_at: new Date(),
		});

		const savedUser = await newUser.save();
		console.log("✅ User saved with ID:", savedUser._id);

		// Create organiser profile
		const organiser = new Organiser({
			user_id: savedUser._id,
			name: name || "New Organisation", // Default value if not provided
			phone: phone || "Not provided", // Default value if not provided
			verification_status: "pending",
		});

		await organiser.save();
		console.log("✅ Organiser profile saved successfully");

		return res.status(201).json({
			message: "Organiser registration successful, please login",
		});
	} catch (error) {
		console.error("Error registering organiser:", error);
		return res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
};

// Keep the old method temporarily for backward compatibility
exports.registerUser = async (req, res) => {
	// Original implementation with default values for name and phone
	// ...
};

/**
 * Authenticate a user and provide access token
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing login credentials
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 *
 * @returns {Object} JSON response with token and user information
 * @throws {Error} If server error occurs during authentication
 *
 * Steps:
 * 1. Validate input (email, password)
 * 2. Find user by email
 * 3. Check if user is active
 * 4. Compare password with stored hash
 * 5. Get user profile based on role (volunteer, organiser, or admin)
 * 6. Update last login time
 * 7. Generate JWT token
 * 8. Return token and user data
 */
exports.loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Step 1: Validate required input fields
		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email and password are required" });
		}

		// Step 2: Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		// Step 3: Check if user account is active
		if (user.status === "suspended") {
			return res.status(401).json({ message: "Account has been suspended. Please contact our staff for assistance" });
		}

		if (user.status === "inactive") {
			return res.status(401).json({ message: "Account has been deactivated. Please contact our staff for assistance" });
		}

		// Step 4: Verify password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		// Step 5: Create JWT payload with user details
		const payload = {
			user: {
				id: user._id,
				email: user.email,
				role: user.role,
			},
		};

		// Step 6: Get user's profile based on role
		let profile;
		if (user.role === "volunteer") {
			profile = await Volunteer.findOne({ user_id: user._id });
		} else if (user.role === "organiser") {
			profile = await Organiser.findOne({ user_id: user._id });
		} else if (user.role === "admin") {
			profile = await Admin.findOne({ user_id: user._id });
		}

		// Step 7: Update last login timestamp
		user.last_login = new Date();
		await user.save();

		// Step 8: Sign JWT token and send response
		jwt.sign(
			payload,
			process.env.JWT_SECRET,
			{ expiresIn: "24h" },
			(err, token) => {
				if (err) throw err;
				res.json({
					message: "Login successful",
					token,
					user: {
						id: user._id,
						email: user.email,
						role: user.role,
						name: profile?.name || profile?.organisation_name || "",
						profile: profile,
					},
				});
			}
		);
	} catch (error) {
		console.error("Error logging in:", error);
		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
};

/**
 * Log out a user and invalidate token
 * For JWT, this is typically handled client-side by removing the token
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * @returns {Object} JSON response with logout status
 * @throws {Error} If server error occurs during logout
 *
 * Steps:
 * 1. Return success response (JWT is stateless, so no server-side action needed)
 */
exports.logoutUser = async (req, res) => {
	try {
		// JWT is stateless, so we don't need to invalidate it server-side
		// Client should remove the token from storage
		res.json({ message: "Logged out successfully" });
	} catch (error) {
		console.error("Error logging out:", error);
		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
};

/**
 * Request a password reset
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {Object} res - Express response object
 *
 * @returns {Object} JSON response with reset token request status
 * @throws {Error} If server error occurs during password reset request
 *
 * Steps:
 * 1. Validate input (email)
 * 2. Find user by email
 * 3. Generate reset token
 * 4. Return success message (with token for testing)
 */
exports.requestPasswordReset = async (req, res) => {
	try {
		const { email } = req.body;

		// Step 1: Validate required input
		if (!email) {
			return res.status(400).json({ message: "Email is required" });
		}

		// Step 2: Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			// Security best practice: Don't reveal that the email doesn't exist
			return res.status(200).json({
				message:
					"If your email exists in our system, you will receive a password reset link",
			});
		}

		// Step 3: Generate reset token with expiration
		const resetToken = jwt.sign(
			{ id: user._id },
			process.env.JWT_RESET_SECRET,
			{ expiresIn: "1h" }
		);

		// Step 4: In production, send reset link via email
		// For now, return token directly for testing
		return res.status(200).json({
			message: "Password reset link sent to your email",
			resetToken, // Note: Remove this in production
		});
	} catch (error) {
		console.error("Error requesting password reset:", error);
		return res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
};

/**
 * Reset password with token
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.token - Password reset token
 * @param {string} req.body.newPassword - New password
 * @param {string} req.body.confirmPassword - Password confirmation
 * @param {Object} res - Express response object
 *
 * @returns {Object} JSON response with password reset status
 * @throws {Error} If server error occurs during password reset
 *
 * Steps:
 * 1. Validate input (token, newPassword, confirmPassword)
 * 2. Verify token
 * 3. Find user by ID from token
 * 4. Hash new password
 * 5. Update user's password
 * 6. Return success message
 */
exports.resetPassword = async (req, res) => {
	try {
		const { token, newPassword, confirmPassword } = req.body;

		// Step 1: Validate required input fields
		if (!token || !newPassword || !confirmPassword) {
			return res.status(400).json({ message: "All fields are required" });
		}

		// Step 2: Validate password confirmation
		if (newPassword !== confirmPassword) {
			return res.status(400).json({ message: "Passwords do not match" });
		}

		// Step 3: Verify token validity and expiration
		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
		} catch (err) {
			return res
				.status(400)
				.json({ message: "Invalid or expired token" });
		}

		// Step 4: Find user from token
		const user = await User.findById(decoded.id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Step 5: Hash new password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(newPassword, salt);

		// Step 6: Update user's password
		user.password = hashedPassword;
		await user.save();

		// Step 7: Return success response
		return res.status(200).json({ message: "Password reset successful" });
	} catch (error) {
		console.error("Error resetting password:", error);
		return res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
};
