const mongoose = require("mongoose");
const { Schema } = mongoose;

const reportSchema = new Schema({
	reporter_id: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	reporter_role: {
		type: String,
		enum: ["volunteer", "organiser", "admin"],
		required: true,
	},
	// Target being reported
	reported_type: {
		type: String,
		enum: ["Volunteer", "Organiser", "Event"],
		required: true,
	},
	reported_id: {
		type: Schema.Types.ObjectId,
		required: true,
		// This is a dynamic reference - could be to User, Organiser, or Event
		refPath: "reported_type",
	},
	event_id: {
		type: Schema.Types.ObjectId,
		ref: "Event",
		// Optional, only if relevant to the report
	},
	reason: {
		type: String,
		required: true,
	},
	details: {
		type: String,
	},
	created_at: {
		type: Date,
		default: Date.now,
	},
	status: {
		type: String,
		enum: ["pending", "under_review", "resolved", "dismissed"],
		default: "pending",
	},
	admin_notes: {
		type: String,
	},
	resolved_by: {
		type: Schema.Types.ObjectId,
		ref: "Admin",
	},
	resolution_date: {
		type: Date,
	},
	resolution_action: {
		type: String,
		enum: ["none", "warning", "suspension", "ban", "event_removed"],
	},
});

module.exports = mongoose.model("Report", reportSchema);
