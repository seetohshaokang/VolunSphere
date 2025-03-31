const mongoose = require("mongoose");
const { Schema } = mongoose;

const adminSchema = new Schema({
	user_id: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	name: {
		type: String,
		required: true,
		trim: true,
	},
	phone: {
		type: String,
		trim: true,
	},
	profile_picture_url: {
		type: String,
	},
	role: {
		type: String,
		enum: ["admin", "supervisor"],
		default: "admin",
		required: true,
	},
	permissions: [
		{
			type: String,
			enum: [
				"manage_users",
				"manage_events",
				"manage_reports",
				"manage_admins",
				"system_settings",
			],
		},
	],
	last_login: {
		type: Date,
	},
	reports_handled: {
		type: Number,
		default: 0,
	},
});

// Create a compound index to ensure one admin per user
adminSchema.index({ user_id: 1 }, { unique: true });

module.exports = mongoose.model("Admin", adminSchema);
