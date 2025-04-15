const mongoose = require("mongoose");
const { Schema } = mongoose;

const organiserSchema = new Schema({
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
  description: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  profile_picture_url: {
    type: String,
  },
  website: {
    type: String,
    trim: true,
  },
  
  verification_status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },

  certification_document: {
    filename: String,
    contentType: String,
    uploaded_at: Date,
    verified: {
      type: Boolean,
      default: false
    },
    verified_at: Date,
    verified_by: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null
    },
    rejection_reason: String
  },
});

// Create a compound index to ensure one organiser per user
organiserSchema.index({ user_id: 1 }, { unique: true });

module.exports = mongoose.model("Organiser", organiserSchema);
