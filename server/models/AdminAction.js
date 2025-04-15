const mongoose = require("mongoose");
const { Schema } = mongoose;

const adminActionSchema = new Schema({
	admin_id: {
		type: Schema.Types.ObjectId,
		ref: "Admin",
		required: true,
	},
	action: {
		type: String,
		enum: ["warning", "suspension", "ban", "event_removed", "verification_approved", "verification_rejected", "status_change"],
		required: true,
	},
	target_type: {
		type: String,
		enum: ["volunteer", "organiser", "event"],
		required: true,
	},
	target_id: {
		type: Schema.Types.ObjectId,
		required: true,
		// This is a dynamic reference - could be to Volunteer, Organiser, or Event
		refPath: "target_type",
	},
	reason: {
		type: String,
	},
	date: {
		type: Date,
		default: Date.now,
	},
	related_report_id: {
		type: Schema.Types.ObjectId,
		ref: "Report",
		// Optional, only if action is related to a specific report
	},
});

module.exports = mongoose.model("AdminAction", adminActionSchema);
