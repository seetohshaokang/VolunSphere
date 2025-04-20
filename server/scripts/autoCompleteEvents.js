// scripts/autoCompleteEvents.js
require("dotenv").config({ path: "./.env.server" });
const mongoose = require("mongoose");
const Event = require("../models/Event");
const connectDB = require("../config/database");

async function autoCompleteEvents() {
  try {
    console.log(" Starting event auto-completion check...");

    // Connect to MongoDB
    await connectDB();
    console.log(" Connected to MongoDB");

    const now = new Date();

    // Update one-time events
    const oneTimeEventsResult = await Event.updateMany(
      {
        is_recurring: false,
        status: "active",
        end_datetime: { $lt: now },
      },
      { $set: { status: "completed" } }
    );

    // Update recurring events
    const recurringEventsResult = await Event.updateMany(
      {
        is_recurring: true,
        status: "active",
        recurrence_end_date: { $lt: now },
      },
      { $set: { status: "completed" } }
    );

    const totalUpdated =
      oneTimeEventsResult.modifiedCount + recurringEventsResult.modifiedCount;

    console.log(
      ` Updated ${oneTimeEventsResult.modifiedCount} one-time events`
    );
    console.log(
      ` Updated ${recurringEventsResult.modifiedCount} recurring events`
    );
    console.log(` Total: ${totalUpdated} events marked as completed`);

    // Close MongoDB connection
    await mongoose.connection.close();
    console.log(" MongoDB connection closed");

    return {
      oneTimeEvents: oneTimeEventsResult.modifiedCount,
      recurringEvents: recurringEventsResult.modifiedCount,
      total: totalUpdated,
    };
  } catch (error) {
    console.error(" Error during event auto-completion:", error);

    // Ensure mongoose connection is closed even if there's an error
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log(" MongoDB connection closed");
    }

    throw error;
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  autoCompleteEvents()
    .then((result) => {
      console.log(" Auto-completion process completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error(" Auto-completion process failed:", error);
      process.exit(1);
    });
}

module.exports = autoCompleteEvents;
