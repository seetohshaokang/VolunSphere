const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./.env.server" });

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_KEY
);

// Signup
const signUpUser = async (req, res) => {
	const { email, password, confirmpassword, role } = req.body;

	try {
		if (confirmpassword !== password) {
			return res.status(400).json({ message: "Passwords do not match" });
		}

		const emailExists = await checkEmailExists(email);
		if (emailExists) {
			return res.status(400).json({ message: "Email already in use" });
		}

		const userResponse = await createAuthUser(email, password);
		if (!userResponse || !userResponse.user) {
			return res.status(500).json({ message: "Failed to create user" });
		}

		const authId = userResponse.user.id; // Supabase Auth UID

		const userData = { auth_id: authId, email, role };
		const insertedUser = await createUser(userData);
		if (!insertedUser) {
			return res.status(500).json({ message: "User creation failed" });
		}
		return res.status(201).json({
			message: "Registration successful, please confirm your email",
		});
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
		return res
			.status(200)
			.json({ message: "Login successful", user: data });
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
