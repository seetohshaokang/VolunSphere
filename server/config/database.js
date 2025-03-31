const mongoose = require("mongoose");
require("dotenv").config();

// MongoDB connection URI from environment variables
const MONGODB_URI =
	process.env.MONGODB_URI || "mongodb://localhost:27017/volunsphere";

// MongoDB connection options
const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	autoIndex: true, // Build indexes
	serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
	socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
	family: 4, // Use IPv4, skip trying IPv6
};

// Connect to MongoDB
const connectDB = async () => {
	try {
		const conn = await mongoose.connect(MONGODB_URI, options);
		console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

		// Listen for connection errors after initial connection
		mongoose.connection.on("error", (err) => {
			console.error(`🔴 MongoDB connection error: ${err}`);
		});

		// Listen for disconnection events
		mongoose.connection.on("disconnected", () => {
			console.warn("🟠 MongoDB disconnected");
		});

		// Listen for reconnection events
		mongoose.connection.on("reconnected", () => {
			console.log("🟢 MongoDB reconnected");
		});

		// Handle process termination
		process.on("SIGINT", async () => {
			await mongoose.connection.close();
			console.log("📦 MongoDB connection closed due to app termination");
			process.exit(0);
		});

		return conn;
	} catch (error) {
		console.error(`🔴 Error connecting to MongoDB: ${error.message}`);
		process.exit(1);
	}
};

module.exports = connectDB;
