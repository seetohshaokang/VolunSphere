const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./.env.server" });

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_KEY
);

// Test database connection
const testConnection = async (req, res) => {
	try {
		const { data, error } = await supabase.from("volunteers").select("*");

		if (error) {
			console.error("Error querying Supabase", error);
			return res
				.status(500)
				.json({ error: "Error querying Supabase", details: error });
		}
		res.json({ message: "Successfully connected to Supabase", data });
	} catch (err) {
		console.error("Error connecting to Supabase", err);
		res.status(500).json({
			error: "Error connecting to Supabase",
			details: err,
		});
	}
};

// Test authentication middleware
const testAuth = (req, res) => {
	return res.json({ message: "Middleware is working", user: req.user });
};

module.exports = { testConnection, testAuth };
