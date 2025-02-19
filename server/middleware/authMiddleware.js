const { createClient } = require("@supabase/supabase-js");
const { create } = require("domain");
require("dotenv").config({ path: "./.env.server" });

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_KEY
);

// Middleware to protect routes
const protectRoute = async (req, res, next) => {
	try {
		// Step 1: Get the token from the Authorisation Header
		const token = req.headers.authorization.split(" ")[1];
		console.log(token);
		if (!token) {
			return res
				.status(401)
				.json({ message: "Unauthorised: No token provided" });
		}

		// Step 2: Verify token with the one obtain from Supa
		const { data, error } = await supabase.auth.getUser(token);

		if (error || !data?.user) {
			return res
				.status(401)
				.json({ message: "Unauthorised: Invalid token" });
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
