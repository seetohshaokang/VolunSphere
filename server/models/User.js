const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true,
	},
	password: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		required: true,
		enum: ["volunteer", "organiser", "admin"],
		default: "volunteer",
	},
	status: {
		type: String,
		enum: ["active", "inactive", "suspended"],
		default: "active",
	},
	created_at: {
		type: Date,
		default: Date.now,
	},
	last_login: {
		type: Date,
	},
});

module.exports = mongoose.model("User", userSchema);
