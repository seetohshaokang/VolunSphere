// clearEvents.js
const { supabase } = require("./config/database");

async function clearEvents() {
	try {
		console.log("Clearing all event data...");

		// First clear all event_registrations that reference events
		const { error: registrationsError } = await supabase
			.from("event_registrations")
			.delete()
			.neq("event_id", 0); // Delete all registrations

		if (registrationsError) {
			throw registrationsError;
		}

		// Then clear all event_reports that reference events
		const { error: reportsError } = await supabase
			.from("event_reports")
			.delete()
			.neq("event_id", 0); // Delete all reports

		if (reportsError) {
			throw reportsError;
		}

		// Finally delete all events
		const { error: eventsError } = await supabase
			.from("events")
			.delete()
			.neq("id", 0); // Delete all events

		if (eventsError) {
			throw eventsError;
		}

		console.log("All event data has been cleared successfully!");
	} catch (error) {
		console.error("Error clearing event data:", error);
	}
}

// Execute the function
clearEvents();
