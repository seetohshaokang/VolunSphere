// clearEvents.js
const { supabase } = require("../config/database");

async function clearEvents() {
	try {
		console.log("Clearing all event-related data...");

		// Step 1: Delete all reports with id > 0
		const { error: reportsError } = await supabase
			.from("reports")
			.delete()
			.gt("id", 0); // Match all reports

		if (reportsError) {
			throw new Error(
				`Failed to delete reports: ${reportsError.message}`
			);
		}
		console.log("✔ All reports deleted.");

		// Step 2: Delete all events with id > 0
		const { error: eventsError } = await supabase
			.from("events")
			.delete()
			.gt("id", 0); // Match all events

		if (eventsError) {
			throw new Error(`Failed to delete events: ${eventsError.message}`);
		}
		console.log("✔ All events deleted.");

		console.log("✅ All event data has been cleared successfully!");
	} catch (error) {
		console.error("❌ Error clearing event data:", error);
	}
}

clearEvents();
