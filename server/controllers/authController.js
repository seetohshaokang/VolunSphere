/**
 * Authentication Controller
 * Handles user authentication operations including signup, login and logout
 */

const { createClient } = require("@supabase/supabase-js");
const {
	baseUserOperations,
	volunteerOperations,
	organiserOperations,
	supabase,
} = require("../config/database");
require("dotenv").config({ path: "./.env.server" });

/**
 * User signup handler
 * Creates a user in both Auth and Database with appropriate role
 */

const signUpUser = async (req, res) => {
	const { email, password, confirmpassword, role } = req.body;

	try {
		// Validate input
		if (!email || !password || !confirmpassword || !role) {
			return res.status(400).json({ message: "All fields are required" });
		}

		// Validate passwords match
		if (confirmpassword !== password) {
			return res.status(400).json({ message: "Passwords do not match" });
		}

		// Validate role is one of the accepted roles
		if (!["volunteer", "organiser"].includes(role)) {
			return res.status(400).json({ message: "Invalid user role" });
		}

		// Check if email already exists
		const emailExists = await baseUserOperations.checkEmailExists(email);
		if (emailExists) {
			return res.status(400).json({ message: "Email already in use" });
		}

		// Start transaction-like process(Supabase doesn't support true transactions across Auth and DB)
		let authUser = null;

		try {
			// Step 1: Create auth user in Supabase Auth
			const userResponse = await createAuthUser(email, password);
			if (!userResponse || !userResponse.user) {
				throw new Error("Failed to create auth user");
			}

			authUser = userResponse.user;
			const authId = authUser.id; // Supabase Auth UID

			// Step 2 Create database user with the appropriate role
			let insertedUser;
			const userData = { auth_id: authId, email, role };
			if (role === "volunteer") {
				insertedUser = await volunteerOperations.createVolunteer(
					userData
				);
			} else {
				insertedUser = await organiserOperations.createOrganiser(
					userData
				);
			}

			if (!insertedUser) {
				throw new Error("User database entry creation failed");
			}
			return res.status(201).json({
				message: "Registration successful, please confirm your email",
			});
		} catch (innerError) {
			// If we created an auth user but database user creation failed
			// attempt to clean up the orphaned auth user
			if (authUser) {
				try {
					await supabase.auth.admin.deleteUser(authUser.id);
					console.log(
						`Cleaned up orphaned auth user: ${authUser.id}`
					);
				} catch (cleanupError) {
					console.error(
						"Failed to clean up orphaned auth user:",
						cleanupError
					);
					// Log this for administrative attention
				}
			}
			throw innerError;
		}
	} catch (err) {
		console.error("Error signing up:", err.message);
		return res
			.status(500)
			.json({ message: "Server error", error: err.message });
	}
};

// Login
const loginUser = async (req, res) => {
	const { email, password } = req.body;

	try {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) {
			return res.status(401).json({ message: "Invalid credentials" });
		}
		const { session } = data;
		return res.status(200).json({
			message: "Login successful",
			user: data,
			token: session.access_token,
		});
	} catch (err) {
		console.error("Error loggin in:", err.message);
		return res
			.status(500)
			.json({ message: "Server error", error: err.message });
	}
};

// Logout function
const logoutUser = async (req, res) => {
	// try catch to catch any errors not caught by the signOut function
	try {
		const { error } = await supabase.auth.signOut();
		if (error) {
			return res.status(500).json({ message: "Logout failed" });
		}
		return res.json({ message: "Logged out successfully" });
	} catch (err) {
		console.error("Error logging out:", err.message);
		return res
			.status(500)
			.json({ message: "Server error", error: err.message });
	}
};

// Helper functions
const createAuthUser = async (email, password) => {
	const { data, error } = await supabase.auth.signUp({ email, password });
	if (error) throw error;
	return data;
};

const createUser = async (userData) => {
	const { data, error } = await supabase
		.from("users")
		.insert([userData])
		.select();
	if (error) throw error;
	return data;
};

const checkEmailExists = async (email) => {
	const { data, error } = await supabase
		.from("users")
		.select("email")
		.eq("email", email);
	if (error) throw error;
	return data.length > 0;
};

module.exports = { logoutUser, loginUser, signUpUser }; //export functions to be used outside of controller
