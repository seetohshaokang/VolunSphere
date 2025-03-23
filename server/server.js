/**
 * Main server entry point
 * Configure Express app and initializes routes
 */

require("dotenv").config({ path: "./.env.server" }); // Load environment variables from .env.server file
const express = require("express");
const cors = require("cors"); // Import CORS to enable cross-origin requests
const authRoutes = require("./routes/authRoutes.js");
const profileRoutes = require("./routes/profileRoutes.js");
const testRoutes = require("./routes/testRoutes.js");
const eventRoutes = require("./routes/eventRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const { default: test } = require("node:test");

// Declare express app and port
const app = express();
const port = process.env.SERVER_PORT || 8000;

// CORS Configuration
const allowedOrigins = [
	"http://localhost:5173",
	"http://localhost:8000",
	"https://volun-sphere.vercel.app",
	"https://volunsphere.onrender.com",
];

// Enable CORS with origina validation
app.use(
	cors({
		origin: function (origin, callback) {
			// Allow requests with no origin (like mobile apps or curl requests)
			if (!origin) return callback(null, true);
			if (allowedOrigins.indexOf(origin) === -1) {
				const msg =
					"The CORS policy for this site does not allow access from the specified Origin.";
				return callback(new Error(msg), false);
			}
			return callback(null, true);
		},
		credentials: true, // Allow cookies to be sent with requests
	})
);

// Parse JSON request bodies
app.use(express.json());

// Root route
app.get("/", (req, res) => {
	res.send("Welcome to the VolunSphere API!");
});

// Mount route handlers
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/profile", profileRoutes);
app.use("/test", testRoutes);
app.use("/admin", adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		message: "Something went wrong!",
		error:
			process.env.NODE_ENV === "production"
				? "An error occured"
				: err.message,
	});
});

// 404 Handler for routes that do not exist
app.use((req, res) => {
	res.status(404).json({ message: "Route not found" });
});

// Start the express server
app.listen(port, () => {
	console.log(
		new Date().toLocaleTimeString() +
			` Volunsphere Server is running on port ${port}...`
	);
});

module.exports = app; // For testing
