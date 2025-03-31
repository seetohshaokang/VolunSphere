const mongoose = require("mongoose");
const { Schema } = mongoose;

const eventSchema = new Schema({
	organiser_id: {
		type: Schema.Types.ObjectId,
		ref: "Organiser",
		required: true,
	},
	name: {
		type: String,
		required: true,
		trim: true,
	},
	description: {
		type: String,
		required: true,
		trim: true,
	},
	location: {
		type: String,
		required: true,
		trim: true,
	},
	causes: [
		{
			type: String,
			trim: true,
		},
	],
	max_volunteers: {
		type: Number,
		min: 1,
	},
	registered_count: {
		type: Number,
		default: 0,
		min: 0,
	},
	image_url: {
		type: String,
	},
	contact_person: {
		type: String,
		trim: true,
	},
	contact_email: {
		type: String,
		trim: true,
	},
	status: {
		type: String,
		enum: ["active", "cancelled", "completed", "draft"],
		default: "active",
	},
	// Time fields
	is_recurring: {
		type: Boolean,
		default: false,
	},
	// For single events
	start_datetime: {
		type: Date,
	},
	end_datetime: {
		type: Date,
	},
	start_day_of_week: {
		type: Number,
		min: 0,
		max: 6,
	},
	// For recurring events
	recurrence_pattern: {
		type: String,
		enum: ["daily", "weekly", "monthly", "custom"],
	},
	recurrence_days: [
		{
			type: Number,
			min: 0,
			max: 6,
		},
	],
	recurrence_start_date: {
		type: Date,
	},
	recurrence_end_date: {
		type: Date,
	},
	recurrence_time: {
		start: String, // e.g. "10:00 AM"
		end: String, // e.g. "12:00 PM"
	},
	created_at: {
		type: Date,
		default: Date.now,
	},
});

// Add validation for dates
eventSchema.pre("validate", function (next) {
	// For non-recurring events, both start and end dates are required
	if (!this.is_recurring) {
		if (!this.start_datetime) {
			this.invalidate(
				"start_datetime",
				"Start date and time is required for non-recurring events"
			);
		}
		if (!this.end_datetime) {
			this.invalidate(
				"end_datetime",
				"End date and time is required for non-recurring events"
			);
		}
		if (
			this.start_datetime &&
			this.end_datetime &&
			this.start_datetime > this.end_datetime
		) {
			this.invalidate(
				"end_datetime",
				"End date cannot be before start date"
			);
		}

		// Auto-derive start_day_of_week
		if (this.start_datetime) {
			this.start_day_of_week = this.start_datetime.getDay();
		}
	}
	// For recurring events, validate recurring fields
	else {
		if (!this.recurrence_pattern) {
			this.invalidate(
				"recurrence_pattern",
				"Recurrence pattern is required for recurring events"
			);
		}
		if (!this.recurrence_start_date) {
			this.invalidate(
				"recurrence_start_date",
				"Recurrence start date is required"
			);
		}
		if (!this.recurrence_end_date) {
			this.invalidate(
				"recurrence_end_date",
				"Recurrence end date is required"
			);
		}
		if (
			this.recurrence_start_date &&
			this.recurrence_end_date &&
			this.recurrence_start_date > this.recurrence_end_date
		) {
			this.invalidate(
				"recurrence_end_date",
				"Recurrence end date cannot be before start date"
			);
		}
		if (
			!this.recurrence_time ||
			!this.recurrence_time.start ||
			!this.recurrence_time.end
		) {
			this.invalidate(
				"recurrence_time",
				"Recurrence start and end times are required"
			);
		}
		if (
			this.recurrence_pattern === "weekly" ||
			this.recurrence_pattern === "custom"
		) {
			if (!this.recurrence_days || this.recurrence_days.length === 0) {
				this.invalidate(
					"recurrence_days",
					"Recurrence days are required for weekly or custom patterns"
				);
			}
		}
	}
	next();
});

module.exports = mongoose.model("Event", eventSchema);
