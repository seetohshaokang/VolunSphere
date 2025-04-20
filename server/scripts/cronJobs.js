// scripts/cronJobs.js
require("dotenv").config({ path: "./.env.server" });
const cron = require("node-cron");
const autoCompleteEvents = require("./autoCompleteEvents");

function initCronJobs() {
  console.log(" Initializing cron jobs...");

  // Run event auto-completion daily at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log(" Running scheduled event auto-completion job...");
    try {
      const result = await autoCompleteEvents();
      console.log(
        ` Completed event status updates: ${result.total} events updated`
      );
    } catch (error) {
      console.error(" Error in event auto-completion job:", error);
    }
  });

  console.log("Cron jobs initialized successfully");
}

module.exports = initCronJobs;
