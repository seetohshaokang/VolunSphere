// scripts/seedTestData.js
require("dotenv").config({ path: "./.env.server" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const Organiser = require("../models/Organiser");
const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const Admin = require("../models/Admin");
const Report = require("../models/Report");
const Review = require("../models/Review");

// MongoDB connection URI
const MONGODB_URI =
	process.env.MONGODB_URI || "mongodb://localhost:27017/volunsphere";

// Sample reviews for seeding
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

// Sample report reasons and details
const reportReasons = [
	{
		reason: "Inappropriate behavior",
		details:
			"The volunteer was making offensive comments to other participants.",
	},
	{
		reason: "Misleading event description",
		details:
			"The event description did not match the actual activities at all. We were told we would be working on environmental cleanup but ended up doing data entry work instead.",
	},
	{
		reason: "Safety concerns",
		details:
			"There were insufficient safety measures at the event. Volunteers were asked to handle hazardous materials without proper protection.",
	},
	{
		reason: "No-show organizer",
		details:
			"The event organizer didn't show up, and nobody was there to guide volunteers.",
	},
	{
		reason: "Fake event",
		details:
			"I believe this event may be fraudulent as the location doesn't exist.",
	},
];

async function seedTestData() {
	try {
		console.log("🌱 Seeding test users, events, reports, and reviews...");

		// Connect to MongoDB
		await mongoose.connect(MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		console.log("✅ Connected to MongoDB");

		// Clear existing test data
		console.log("🧹 Clearing existing test data...");
		await User.deleteMany({});
		await Volunteer.deleteMany({});
		await Organiser.deleteMany({});
		await Event.deleteMany({});
		await EventRegistration.deleteMany({});
		await Admin.deleteMany({});
		await Report.deleteMany({});
		await Review.deleteMany({});
		console.log("✅ Existing test data cleared");

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash("password", salt);

		// Create test volunteer user
		const volunteerUser = new User({
			email: "testvolunteer1@gmail.com",
			password: hashedPassword,
			role: "volunteer",
			status: "active",
			created_at: new Date(),
			last_login: new Date(),
		});

		const savedVolunteerUser = await volunteerUser.save();
		console.log(`✅ Created volunteer user: ${savedVolunteerUser.email}`);

		// Create volunteer profile
		const volunteer = new Volunteer({
			user_id: savedVolunteerUser._id,
			name: "Test Volunteer",
			phone: "91234567",
			bio: "I love volunteering for green causes.",
			address: "123 Test Lane",
			dob: new Date("1990-01-01"),
			profile_picture_url: null,
			skills: ["Education", "Healthcare", "Environment"],
			preferred_causes: ["education", "healthcare", "environment"],
			nric_image: {
				data: Buffer.from("This is fake image data", "utf-8"),
				contentType: "vite.svg",
				uploaded_at: new Date(),
				verified: false,
			},
		});

		await volunteer.save();
		console.log(
			`✅ Created volunteer profile for: ${savedVolunteerUser.email}`
		);

		// Create test organiser user
		const organiserUser = new User({
			email: "testorganiser1@gmail.com",
			password: hashedPassword,
			role: "organiser",
			status: "active",
			created_at: new Date(),
			last_login: new Date(),
		});

		const savedOrganiserUser = await organiserUser.save();
		console.log(`✅ Created organiser user: ${savedOrganiserUser.email}`);

		// Create organiser profile
		const organiser = new Organiser({
			user_id: savedOrganiserUser._id,
			name: "Test Organisation",
			phone: "98765432",
			description: "We host educational events.",
			address: "456 Org Street",
			profile_picture_url: null,
			verification_status: "verified",
			website: "https://testorg.example.com",
		});

		const savedOrganiser = await organiser.save();
		console.log(
			`✅ Created organiser profile for: ${savedOrganiserUser.email}`
		);

		// Create test admin user
		const adminUser = new User({
			email: "admin@volunsphere.com",
			password: hashedPassword,
			role: "admin",
			status: "active",
			created_at: new Date(),
			last_login: new Date(),
		});

		const savedAdminUser = await adminUser.save();
		console.log(`✅ Created admin user: ${savedAdminUser.email}`);

		// Create admin profile with all permissions
		const admin = new Admin({
			user_id: savedAdminUser._id,
			name: "System Administrator",
			phone: "88888888",
			profile_picture_url: null,
			role: "supervisor", // Give the highest level of admin privileges
			permissions: [
				"manage_users",
				"manage_events",
				"manage_reports",
				"manage_admins",
				"system_settings",
			],
			last_login: new Date(),
			reports_handled: 0,
		});

		await admin.save();
		console.log(`✅ Created admin profile for: ${savedAdminUser.email}`);

		// Create events
		const events = [
			{
				organiser_id: savedOrganiser._id,
				name: "Beach Cleanup Drive",
				description:
					"Join us for a community beach cleanup event. Help keep our beaches clean and protect marine life.",
				location: "Changi Beach",
				causes: ["environment"],
				max_volunteers: 20,
				registered_count: 0,
				contact_person: "Test Organiser",
				contact_email: "testorganiser1@gmail.com",
				status: "active",
				is_recurring: false,
				start_datetime: new Date("2025-04-15T09:00:00"),
				end_datetime: new Date("2025-04-15T12:00:00"),
				start_day_of_week: new Date("2025-04-15").getDay(),
				created_at: new Date(),
			},
			{
				organiser_id: savedOrganiser._id,
				name: "Literacy Program",
				description:
					"Volunteer to read with children and support literacy skills development.",
				location: "Public Library",
				causes: ["education"],
				max_volunteers: 10,
				registered_count: 0,
				contact_person: "Test Organiser",
				contact_email: "testorganiser1@gmail.com",
				status: "active",
				is_recurring: true,
				recurrence_pattern: "weekly",
				recurrence_days: [5], // Friday
				recurrence_start_date: new Date("2025-04-25"),
				recurrence_end_date: new Date("2025-07-25"),
				recurrence_time: {
					start: "16:00",
					end: "18:00",
				},
				created_at: new Date(),
			},
			{
				organiser_id: savedOrganiser._id,
				name: "Food Distribution Drive",
				description:
					"Help pack and distribute food packages to families in need in our community.",
				location: "Central Community Center",
				causes: ["social services"],
				max_volunteers: 25,
				registered_count: 0,
				contact_person: "Test Organiser",
				contact_email: "testorganiser1@gmail.com",
				status: "active",
				is_recurring: false,
				start_datetime: new Date("2025-04-10T10:00:00"),
				end_datetime: new Date("2025-04-10T14:00:00"),
				start_day_of_week: new Date("2025-04-10").getDay(),
				created_at: new Date(),
			},
		];

		const createdEvents = await Event.insertMany(events);
		console.log(`✅ Created ${createdEvents.length} events`);

		// Register volunteer for the first event
		const firstEvent = createdEvents[0];

		const registration = new EventRegistration({
			user_id: volunteer.user_id, // or savedVolunteerUser._id
			event_id: firstEvent._id,
			status: "confirmed", // Use a value from the enum
			signup_date: new Date(),
		});

		await registration.save();

		// Update event registration count
		await Event.findByIdAndUpdate(firstEvent._id, {
			$inc: { registered_count: 1 },
		});

		console.log(
			`✅ Registered test volunteer for "${firstEvent.name}" event`
		);

		// Create test reports
		console.log("🔍 Creating test reports...");

		const reports = [
			// Pending report about an event (from volunteer)
			{
				reporter_id: savedVolunteerUser._id,
				reporter_role: "volunteer",
				reported_type: "Event",
				reported_id: createdEvents[1]._id, // Report about the second event
				event_id: createdEvents[1]._id,
				reason: reportReasons[1].reason,
				details: reportReasons[1].details,
				created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
				status: "pending",
			},

			// Under review report about an organizer (from volunteer)
			{
				reporter_id: savedVolunteerUser._id,
				reporter_role: "volunteer",
				reported_type: "Organiser",
				reported_id: savedOrganiser._id,
				event_id: createdEvents[0]._id, // Related to first event
				reason: reportReasons[3].reason,
				details: reportReasons[3].details,
				created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
				status: "under_review",
			},

			// Resolved report about an event (from organizer)
			{
				reporter_id: savedOrganiserUser._id,
				reporter_role: "organiser",
				reported_type: "Event",
				reported_id: createdEvents[2]._id, // Report about the third event
				reason: reportReasons[4].reason,
				details: reportReasons[4].details,
				created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
				status: "resolved",
				admin_notes:
					"Investigated the event and confirmed it was legitimate. Location details were confusing but have been clarified with the organizer.",
				resolved_by: admin._id,
				resolution_date: new Date(
					Date.now() - 12 * 24 * 60 * 60 * 1000
				), // 12 days ago
				resolution_action: "none",
			},

			// Dismissed report about a volunteer (from organizer)
			{
				reporter_id: savedOrganiserUser._id,
				reporter_role: "organiser",
				reported_type: "Volunteer",
				reported_id: volunteer._id,
				event_id: createdEvents[0]._id,
				reason: reportReasons[0].reason,
				details:
					"The volunteer was not following instructions and was disruptive.",
				created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
				status: "dismissed",
				admin_notes:
					"After speaking with multiple participants, we found no evidence of the reported behavior.",
				resolved_by: admin._id,
				resolution_date: new Date(
					Date.now() - 18 * 24 * 60 * 60 * 1000
				), // 18 days ago
				resolution_action: "none",
			},

			// Another pending report about the same event (from another user - we'll use the organizer as reporter for simplicity)
			{
				reporter_id: savedOrganiserUser._id,
				reporter_role: "organiser",
				reported_type: "Event",
				reported_id: createdEvents[1]._id,
				event_id: createdEvents[1]._id,
				reason: reportReasons[2].reason,
				details: reportReasons[2].details,
				created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
				status: "pending",
			},
		];

		// Insert reports
		const createdReports = await Report.insertMany(reports);
		console.log(`✅ Created ${createdReports.length} reports`);

		// Seed reviews
		console.log("📝 Creating event reviews...");

		const reviews = [];
		const timestamp = Date.now(); // Add timestamp to make emails unique

		// Create 2-3 reviews for each event
		for (const event of createdEvents) {
			// Create 2-3 reviews per event
			const numReviews = Math.floor(Math.random() * 2) + 2; // 2-3 reviews

			// First review from our test volunteer
			const userReview = {
				reviewer_id: savedVolunteerUser._id,
				entity_type: "Event",
				entity_id: event._id,
				rating: Math.floor(Math.random() * 3) + 3, // 3-5 rating for test volunteer
				comment:
					sampleReviews[
						Math.floor(Math.random() * sampleReviews.length)
					].comment,
				created_at: new Date(
					Date.now() -
						Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000
				), // Random date in the last 10 days
				updated_at: new Date(),
			};
			reviews.push(userReview);

			// Additional reviews (1-2 more)
			// We'll create some temporary users for these reviews
			for (let i = 0; i < numReviews - 1; i++) {
				// Create a temporary user for the review with a unique email
				const uniqueEmail = `reviewer${i}_${timestamp}_${Math.floor(
					Math.random() * 10000
				)}@example.com`;

				const tempUser = new User({
					email: uniqueEmail,
					password: hashedPassword,
					role: "volunteer",
					status: "active",
					created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
				});
				const savedTempUser = await tempUser.save();

				// Create a temp volunteer profile
				const tempVolunteer = new Volunteer({
					user_id: savedTempUser._id,
					name: `Reviewer ${i + 1}`,
					phone: `9${Math.floor(Math.random() * 10000000)}`,
					dob: new Date("1985-05-15"),
					skills: ["Communication"],
					preferred_causes: ["education"],
				});
				await tempVolunteer.save();

				// Create the review
				const review = {
					reviewer_id: savedTempUser._id,
					entity_type: "Event",
					entity_id: event._id,
					rating: Math.floor(Math.random() * 5) + 1, // 1-5 rating
					comment:
						sampleReviews[
							Math.floor(Math.random() * sampleReviews.length)
						].comment,
					created_at: new Date(
						Date.now() -
							Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000
					), // Random date in the last 20 days
					updated_at: new Date(),
				};
				reviews.push(review);
			}
		}

		// Insert all reviews
		await Review.insertMany(reviews);
		console.log(`✅ Created ${reviews.length} reviews`);

		console.log("🎉 Seeding complete!");
		console.log("\nTest Account Information:");
		console.log("------------------------");
		console.log("Volunteer: testvolunteer1@gmail.com (password: password)");
		console.log("Organiser: testorganiser1@gmail.com (password: password)");
		console.log("Admin: admin@volunsphere.com (password: password)");
		console.log("------------------------");

		// Close MongoDB connection
		await mongoose.connection.close();
		console.log("🔄 MongoDB connection closed");
	} catch (error) {
		console.error("❌ Seeding failed:", error);
		// Ensure mongoose connection is closed even if there's an error
		if (mongoose.connection.readyState !== 0) {
			await mongoose.connection.close();
			console.log("🔄 MongoDB connection closed");
		}
		process.exit(1);
	}
}

seedTestData();
