require("dotenv").config({ path: "./.env.server" }); // Load environment variables from .env.server file
const express = require("express");
const { createClient } = require("@supabase/supabase-js");

// Declare express app and port
const app = express();
const port = process.env.SERVER_PORT || 8000;
// Create a new Supabase client
const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_KEY
);

// Test connection to Supabase endpoint
app.get("/test-connection", async (req, res) => {
	try {
		// Test connection by querying data from table
		const { data, error } = await supabase.from("volunteers").select("*");

		if (error) {
			// If error querying DB
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
});

// Start the express server
app.listen(port, () => {
	console.log(
		new Date().toLocaleTimeString() +
			` Volunsphere Server is runing on port ${port}...`
	);
});
