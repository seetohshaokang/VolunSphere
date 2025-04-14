const mongoose = require("mongoose");
const { Schema } = mongoose;

const volunteerSchema = new Schema({
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
		required: true,
		trim: true,
	},
	bio: {
		type: String,
		trim: true,
	},
	address: {
		type: String,
		trim: true,
	},
	dob: {
		type: Date,
		required: true,
	},
	profile_picture_url: {
		type: String,
	},
	skills: [
		{
			type: String,
			trim: true,
		},
	],
	preferred_causes: [
		{
			type: String,
			trim: true,
		},
	],
	nric_image: {
		filename: String,
		contentType: String,
		uploaded_at: Date,
		verified: {
			type: Boolean,
			default: false,
		},
	},
});

// Create a compound index to ensure one volunteer per user
volunteerSchema.index({ user_id: 1 }, { unique: true });

module.exports = mongoose.model("Volunteer", volunteerSchema);
