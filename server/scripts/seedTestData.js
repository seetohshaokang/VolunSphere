// scripts/seedTestData.js
require("dotenv").config({ path: "./.env.server" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedTestData() {
	try {
		console.log("🌱 Seeding test users and events...");

		const users = [
			{
				email: "testvolunteer1@gmail.com",
				password: "password",
				role: "volunteer",
				name: "Test Volunteer",
				phone: "91234567",
				bio: "I love volunteering for green causes.",
				address: "123 Test Lane",
				dob: "1990-01-01",
				profile_picture_url: null,
				status: "active",
			},
			{
				email: "testorganiser1@gmail.com",
				password: "password",
				role: "organiser",
				name: "Test Organiser",
				phone: "98765432",
				bio: "We host educational events.",
				address: "456 Org Street",
				dob: "1985-05-15",
				profile_picture_url: null,
				status: "active",
			},
		];

		let organiserAuthId = null;
		let volunteerId = null;

		for (const user of users) {
			const { data: listData } = await supabase.auth.admin.listUsers();
			const exists = listData.users.find((u) => u.email === user.email);

			if (exists) {
				console.log(
					`⚠️ User ${user.email} already exists, skipping creation.`
				);

				const { data: existingDbUser, error: fetchError } =
					await supabase
						.from("users")
						.select("auth_id, user_id")
						.eq("email", user.email)
						.maybeSingle();

				if (fetchError || !existingDbUser) {
					throw new Error(
						`User ${user.email} exists in Auth but not in DB.`
					);
				}

				if (user.role === "organiser") {
					organiserAuthId = existingDbUser.auth_id;
				} else if (user.role === "volunteer") {
					volunteerId = existingDbUser.user_id;
				}
				continue;
			}

			// Create in Auth
			const { data: authUser, error: authError } =
				await supabase.auth.admin.createUser({
					email: user.email,
					password: user.password,
					email_confirm: true,
				});
			if (authError) throw new Error(authError.message);

			console.log(`✅ Created Auth user: ${user.email}`);

			// Create in DB
			const userData = {
				auth_id: authUser.user.id,
				email: user.email,
				role: user.role,
				name: user.name,
				phone: user.phone,
				bio: user.bio,
				address: user.address,
				dob: user.dob,
				profile_picture_url: user.profile_picture_url,
				status: user.status,
				created_at: new Date(),
			};

			const { data: inserted, error: dbError } = await supabase
				.from("users")
				.insert([userData])
				.select();

			if (dbError) {
				await supabase.auth.admin.deleteUser(authUser.user.id);
				throw new Error(
					`DB insert failed for ${user.email}: ${dbError.message}`
				);
			}

			if (user.role === "organiser") {
				organiserAuthId = authUser.user.id;

				await supabase.from("organisation_details").insert([
					{
						user_id: inserted[0].user_id,
						organisation_name: "Test Organisation",
						description: "For dev seeding",
					},
				]);
			}

			if (user.role === "volunteer") {
				volunteerId = inserted[0].user_id;

				await supabase.from("volunteer_skills").insert(
					["Education", "Healthcare", "Environment"].map((skill) => ({
						user_id: inserted[0].user_id,
						skill_name: skill,
					}))
				);
			}
		}

		// Create events
		if (!organiserAuthId)
			throw new Error("No organiser available to seed events.");

		const events = [
			{
				name: "Beach Cleanup Drive",
				duration: "3 hours",
				description:
					"Join us for a community beach cleanup event. Help keep our beaches clean and protect marine life.",
				cause: "Environment",
				location: "Changi Beach",
				organiser_id: organiserAuthId,
				start_date: "2025-04-15",
				end_date: "2025-04-15",
				status: "active",
				start_time: "09:00:00",
				end_time: "12:00:00",
				is_recurring: false,
				max_volunteers: 20,
				registered_count: 0,
			},
			{
				name: "Literacy Program",
				duration: "2 hours",
				description:
					"Volunteer to read with children and support literacy skills development.",
				cause: "Education",
				location: "Public Library",
				organiser_id: organiserAuthId,
				start_date: "2025-04-25",
				end_date: "2025-04-25",
				status: "active",
				start_time: "16:00:00",
				end_time: "18:00:00",
				is_recurring: true,
				recurrence_pattern: "weekly",
				recurrence_day: 5,
				max_volunteers: 10,
				registered_count: 0,
			},
			{
				name: "Food Distribution Drive",
				duration: "4 hours",
				description:
					"Help pack and distribute food packages to families in need in our community.",
				cause: "Social Services",
				location: "Central Community Center",
				organiser_id: organiserAuthId,
				start_date: "2025-04-10",
				end_date: "2025-04-10",
				status: "active",
				start_time: "10:00:00",
				end_time: "14:00:00",
				is_recurring: false,
				max_volunteers: 25,
				registered_count: 0,
			},
		];

		const { data: createdEvents, error: eventError } = await supabase
			.from("events")
			.insert(events)
			.select();

		if (eventError) throw new Error(eventError.message);

		console.log(`✅ Created ${createdEvents.length} events`);

		// Register volunteer for first event if volunteer exists
		if (volunteerId && createdEvents && createdEvents.length > 0) {
			const firstEvent = createdEvents[0];

			const { error: regError } = await supabase
				.from("event_registrations")
				.insert([
					{
						user_id: volunteerId,
						event_id: firstEvent.id,
						status: "registered",
						created_at: new Date(),
					},
				]);

			if (regError) {
				console.warn(
					`⚠️ Could not register volunteer: ${regError.message}`
				);
			} else {
				// Update the event registration count
				await supabase
					.from("events")
					.update({ registered_count: 1 })
					.eq("id", firstEvent.id);

				console.log(
					`✅ Registered test volunteer for "${firstEvent.name}" event`
				);
			}
		}

		console.log("🎉 Seeding complete!");
	} catch (error) {
		console.error("❌ Seeding failed:", error.message);
	}
}

seedTestData();
