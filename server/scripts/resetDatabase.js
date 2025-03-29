// scripts/resetDatabase.js
require("dotenv").config({ path: "./.env.server" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_SERVICE_ROLE_KEY
);

const tableKeyMap = {
	reports: "id",
	events: "id",
	volunteer_skills: "id",
	volunteers: "id",
	users: "user_id",
};

async function resetDatabase() {
	try {
		console.log("🧹 Starting full database reset...");

		// Step 1: Delete all Auth users
		const { data: listData, error: listError } =
			await supabase.auth.admin.listUsers();
		if (listError) throw new Error("Failed to list Auth users.");

		for (const user of listData.users) {
			await supabase.auth.admin.deleteUser(user.id);
			console.log(`🗑️ Deleted Auth user: ${user.email}`);
		}

		// Step 2: Clear relational tables in order
		const tables = ["reports", "events", "volunteers", "users"];

		for (const table of tables) {
			const pk = tableKeyMap[table] || "id";
			console.log(`⛔ Deleting rows from "${table}"...`);
			const { error } = await supabase.from(table).delete().gt(pk, 0);
			if (error)
				throw new Error(`❌ Failed on ${table}: ${error.message}`);
		}

		console.log("✅ Database and Auth reset complete.");
	} catch (err) {
		console.error("❌ Error during reset:", err);
	}
}

resetDatabase();
