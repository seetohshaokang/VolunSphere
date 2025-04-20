// scripts/resetDatabase.js
require("dotenv").config({ path: "./.env.server" });
const mongoose = require("mongoose");
const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const Organiser = require("../models/Organiser");
const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const Report = require("../models/Report");
const Admin = require("../models/Admin");
const AdminAction = require("../models/AdminAction");
const Review = require("../models/Review");

// MongoDB connection URI
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/volunsphere";

async function resetDatabase() {
  try {
    console.log("🧹 Starting full database reset...");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(" Connected to MongoDB");

    // Clear collections in appropriate order (respecting dependencies)
    const collectionsToClear = [
      { model: AdminAction, name: "AdminAction" },
      { model: Report, name: "Report" },
      { model: Review, name: "Review" },
      { model: EventRegistration, name: "EventRegistration" },
      { model: Event, name: "Event" },
      { model: Admin, name: "Admin" },
      { model: Volunteer, name: "Volunteer" },
      { model: Organiser, name: "Organiser" },
      { model: User, name: "User" },
    ];

    for (const collection of collectionsToClear) {
      console.log(` Deleting data from "${collection.name}"...`);
      const result = await collection.model.deleteMany({});
      console.log(
        ` Cleared ${result.deletedCount} documents from ${collection.name}`
      );
    }

    console.log(" Database reset complete.");
    console.log("\nTo reseed the database with test data, run:");
    console.log("node server/scripts/seedTestData.js");

    // Close MongoDB connection
    await mongoose.connection.close();
    console.log(" MongoDB connection closed");
  } catch (err) {
    console.error(" Error during reset:", err);
    // Ensure mongoose connection is closed even if there's an error
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log(" MongoDB connection closed");
    }
    process.exit(1);
  }
}

resetDatabase();
