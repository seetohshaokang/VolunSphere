const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  reviewer_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  entity_type: {
    type: String,
    enum: ["Event", "Organiser"],
    default: "Event",
    required: true,
  },
  entity_id: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "entity_type",
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: false,
    maxlength: 1000,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index to ensure a user can only review an entity once
reviewSchema.index({ reviewer_id: 1, entity_type: 1, entity_id: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema); 