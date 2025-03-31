const mongoose = require("mongoose");
const { Schema } = mongoose;

const eventRegistrationSchema = new Schema({
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
	status: {
		type: String,
		enum: ["registered", "attended", "no_show", "cancelled"],
		default: "registered",
	},
	registration_date: {
		type: Date,
		default: Date.now,
	},
	check_in_time: {
		type: Date,
	},
	check_out_time: {
		type: Date,
	},
	feedback: {
		from_volunteer: {
			comment: String,
			rating: {
				type: Number,
				min: 1,
				max: 5,
			},
			submitted_at: Date,
		},
		from_organiser: {
			comment: String,
			rating: {
				type: Number,
				min: 1,
				max: 5,
			},
			submitted_at: Date,
		},
	},
});

// Ensure that a volunteer can only register once for an event
eventRegistrationSchema.index(
	{ volunteer_id: 1, event_id: 1 },
	{ unique: true }
);

module.exports = mongoose.model("EventRegistration", eventRegistrationSchema);
