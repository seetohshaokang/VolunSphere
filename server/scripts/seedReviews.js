const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Review = require("../models/Review");
const Event = require("../models/Event");
const User = require("../models/User");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env.server") });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected for seeding reviews"))
  .catch((err) => console.error("MongoDB connection error:", err));

const sampleReviews = [
  {
    rating: 5,
    comment:
      "Great experience! Well organized and very fulfilling. The kids were amazing and the staff was very supportive.",
  },
  {
    rating: 4,
    comment:
      "Really enjoyed volunteering here. The only downside was the location was a bit hard to find.",
  },
  {
    rating: 5,
    comment:
      "Fantastic event! I learned a lot and met some wonderful people. Will definitely join again.",
  },
  {
    rating: 3,
    comment:
      "The event was okay. The concept was good but the execution could have been better. I hope they improve next time.",
  },
  {
    rating: 5,
    comment:
      "An absolute joy to be part of this initiative! The impact we made was immediately visible and the team was very welcoming.",
  },
  {
    rating: 4,
    comment:
      "Meaningful experience that I would recommend to others. The organization was good and the cause is definitely worthwhile.",
  },
];

const seedReviews = async () => {
  try {
    // Clear existing reviews
    await Review.deleteMany({});
    console.log("Cleared existing reviews");

    // Get all events
    const events = await Event.find();
    if (events.length === 0) {
      console.error("No events found. Please seed events first.");
      process.exit(1);
    }

    // Get volunteer users
    const volunteers = await User.find({ role: "volunteer" });
    if (volunteers.length === 0) {
      console.error("No volunteer users found. Please seed users first.");
      process.exit(1);
    }

    const reviews = [];

    // Create 3-5 reviews for each event
    for (const event of events) {
      // Randomly select 3-5 volunteers for each event
      const numReviews = Math.floor(Math.random() * 3) + 3; // 3-5 reviews
      const shuffledVolunteers = volunteers.sort(() => 0.5 - Math.random());
      const eventReviewers = shuffledVolunteers.slice(0, numReviews);

      for (const volunteer of eventReviewers) {
        // Select a random review from the samples
        const review = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];

        reviews.push({
          reviewer_id: volunteer._id,
          entity_type: "Event",
          entity_id: event._id,
          rating: review.rating,
          comment: review.comment,
          created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date in the last 30 days
          updated_at: new Date(),
        });
      }
    }

    // Insert all reviews
    await Review.insertMany(reviews);
    console.log(`Successfully seeded ${reviews.length} reviews`);

    mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding reviews:", error);
    process.exit(1);
  }
};

seedReviews(); 