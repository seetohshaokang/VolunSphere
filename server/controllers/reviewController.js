const Review = require("../models/Review");
const User = require("../models/User");
const Event = require("../models/Event");
const mongoose = require("mongoose");

/**
 * Get all reviews for an event
 */
exports.getEventReviews = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    // Find reviews for this event
    const reviews = await Review.find({
      entity_type: "Event",
      entity_id: id,
    }).populate({
      path: "reviewer_id",
      select: "name profile_picture_url",
    });

    // Format reviews for the frontend
    const formattedReviews = reviews.map((review) => {
      return {
        id: review._id,
        reviewer: review.reviewer_id.name,
        reviewer_id: review.reviewer_id._id,
        rating: review.rating,
        comment: review.comment,
        date: review.created_at,
        avatar: review.reviewer_id.profile_picture_url,
      };
    });

    return res.status(200).json(formattedReviews);
  } catch (error) {
    console.error("Error getting event reviews:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Create a review for an event
 */
exports.createEventReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    // Check if event exists
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating is required and must be between 1 and 5",
      });
    }

    // Check if user has already reviewed this event
    const existingReview = await Review.findOne({
      reviewer_id: userId,
      entity_type: "Event",
      entity_id: id,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this event",
      });
    }

    // Create new review
    const newReview = new Review({
      reviewer_id: userId,
      entity_type: "Event",
      entity_id: id,
      rating,
      comment: comment || "",
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Save review
    const savedReview = await newReview.save();

    // Get user info for response
    const user = await User.findById(userId).select("name profile_picture_url");

    // Format response
    const formattedReview = {
      id: savedReview._id,
      reviewer: user.name,
      reviewer_id: user._id,
      rating: savedReview.rating,
      comment: savedReview.comment,
      date: savedReview.created_at,
      avatar: user.profile_picture_url,
    };

    return res.status(201).json(formattedReview);
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Update a review
 */
exports.updateEventReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    // Check if IDs are valid
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    // Find review by ID
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user is the review owner
    if (review.reviewer_id.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to update this review",
      });
    }

    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // Update review
    const updateFields = {};
    if (rating) updateFields.rating = rating;
    if (comment !== undefined) updateFields.comment = comment;
    updateFields.updated_at = new Date();

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { $set: updateFields },
      { new: true }
    ).populate({
      path: "reviewer_id",
      select: "name profile_picture_url",
    });

    // Format response
    const formattedReview = {
      id: updatedReview._id,
      reviewer: updatedReview.reviewer_id.name,
      reviewer_id: updatedReview.reviewer_id._id,
      rating: updatedReview.rating,
      comment: updatedReview.comment,
      date: updatedReview.updated_at,
      avatar: updatedReview.reviewer_id.profile_picture_url,
    };

    return res.status(200).json(formattedReview);
  } catch (error) {
    console.error("Error updating review:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Delete a review
 */
exports.deleteEventReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    const userId = req.user.id;

    // Check if IDs are valid
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    // Find review by ID
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user is the review owner
    if (review.reviewer_id.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to delete this review",
      });
    }

    // Delete review
    await Review.findByIdAndDelete(reviewId);

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}; 