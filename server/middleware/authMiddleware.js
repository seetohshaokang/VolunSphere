const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./.env.server" });

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_KEY
);

// Middleware to protect routes
const protectRoute = async (req, res, next) => {
	try {
		// Check if Authorization header exists
		if (!req.headers.authorization) {
			return res.status(401).json({
				message: "Unauthorized: No authorization header provided",
			});
		}

		// Check if it follows Bearer token format
		if (!req.headers.authorization.startsWith("Bearer ")) {
			return res.status(401).json({
				message: "Unauthorized: Invalid authorization format",
			});
		}

		// Extract token safely
		const token = req.headers.authorization.split(" ")[1];

		if (!token) {
			return res
				.status(401)
				.json({ message: "Unauthorized: No token provided" });
		}

		// Verify token with Supabase
		const { data, error } = await supabase.auth.getUser(token);

		if (error || !data?.user) {
			return res
				.status(401)
				.json({ message: "Unauthorized: Invalid token" });
		}

		// Step 3 Attach the user data to request
		req.user = data.user;
		next(); // Step 4: Proceed to the next middleware/controller
	} catch (err) {
		console.error("Error in auth middleware:", err.message);
		return res.status(500).json({ message: "Internal server error" });
	}
};

module.exports = { protectRoute };
