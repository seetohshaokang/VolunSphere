const mongoose = require("mongoose");
const { Schema } = mongoose;

const certificateSchema = new Schema({
	user_id: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	volunteer_id: {
		type: Schema.Types.ObjectId,
		ref: "Volunteer",
		required: true,
	},
	event_id: {
		type: Schema.Types.ObjectId,
		ref: "Event",
		required: true,
	},
	certificate_id: {
		type: String,
		required: true,
		unique: true,
	},
	issuance_date: {
		type: Date,
		default: Date.now,
	},
	pdf_path: {
		type: String,
	},
	hours_contributed: {
		type: Number,
	},
	skills_demonstrated: [String],
});

module.exports = mongoose.model("Certificate", certificateSchema);
