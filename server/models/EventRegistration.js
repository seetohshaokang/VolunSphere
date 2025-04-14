const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventRegistrationSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  event_id: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "removed_by_organizer"],
    default: "confirmed",
  },
  removal_reason: {
    type: String,
    default: null,
  },
  signup_date: {
    type: Date,
    default: Date.now,
  },
  attendance_status: {
    type: String,
    enum: ["not_attended", "attended", "no_show"],
    default: "not_attended",
  },
  check_in_time: {
    type: Date,
    default: null,
  },
  check_out_time: {
    type: Date,
    default: null,
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

// Create a compound index to prevent duplicate registrations
eventRegistrationSchema.index({ user_id: 1, event_id: 1 }, { unique: true });

module.exports = mongoose.model("EventRegistration", eventRegistrationSchema);
