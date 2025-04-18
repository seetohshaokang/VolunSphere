// scripts/seedTestData.js
require("dotenv").config({ path: "./.env.server" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const Organiser = require("../models/Organiser");
const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const Admin = require("../models/Admin");

// MongoDB connection URI
const MONGODB_URI =
	process.env.MONGODB_URI || "mongodb://localhost:27017/volunsphere";

async function seedTestData() {
	try {
		console.log("🌱 Seeding test users and events...");

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
		console.log("✅ Existing test data cleared");

		// Create upload directories if they don't exist
		const nricUploadDir = path.join(__dirname, "../public/uploads/nric");
		const organizerDocsDir = path.join(
			__dirname,
			"../public/uploads/organizer_docs"
		);

		if (!fs.existsSync(nricUploadDir)) {
			fs.mkdirSync(nricUploadDir, { recursive: true });
			console.log(`✅ Created directory: ${nricUploadDir}`);
		}
		if (!fs.existsSync(organizerDocsDir)) {
			fs.mkdirSync(organizerDocsDir, { recursive: true });
			console.log(`✅ Created directory: ${organizerDocsDir}`);
		}

		// Copy sample documents (ensure these files exist in sample-docs folder)
		const sampleNricPath = path.join(
			__dirname,
			"sample-docs/sample-nric.jpg"
		);
		const sampleCertPath = path.join(
			__dirname,
			"sample-docs/sample-certificate.jpg"
		);

		// Generate unique filenames
		const nricFilename = `nric-${Date.now()}-${Math.floor(
			Math.random() * 100000000
		)}.jpg`;
		const certFilename = `cert-${Date.now()}-${Math.floor(
			Math.random() * 100000000
		)}.jpg`;

		// Destination paths
		const nricDestPath = path.join(nricUploadDir, nricFilename);
		const certDestPath = path.join(organizerDocsDir, certFilename);

		// Copy files if they exist, otherwise use fallback approach
		let nricFileExists = false;
		let certFileExists = false;

		if (fs.existsSync(sampleNricPath)) {
			fs.copyFileSync(sampleNricPath, nricDestPath);
			console.log(`✅ Copied sample NRIC to ${nricDestPath}`);
			nricFileExists = true;
		} else {
			console.log(
				`⚠️ Sample NRIC not found at ${sampleNricPath}, will use placeholder data`
			);
		}

		if (fs.existsSync(sampleCertPath)) {
			fs.copyFileSync(sampleCertPath, certDestPath);
			console.log(`✅ Copied sample certificate to ${certDestPath}`);
			certFileExists = true;
		} else {
			console.log(
				`⚠️ Sample certificate not found at ${sampleCertPath}, will use placeholder data`
			);
		}

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

		// Create volunteer profile with verified NRIC
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
				filename: nricFileExists
					? nricFilename
					: "seeded-test-nric.jpg",
				contentType: "image/jpeg",
				uploaded_at: new Date(),
				verified: true,
				rejection_reason: null,
				requires_reupload: false,
			},
		});

		await volunteer.save();
		console.log(
			`✅ Created verified volunteer profile for: ${savedVolunteerUser.email}`
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

		// Create organiser profile with verified certificate
		const organiser = new Organiser({
			user_id: savedOrganiserUser._id,
			name: "Test Organisation",
			phone: "98765432",
			description: "We host educational events.",
			address: "456 Org Street",
			profile_picture_url: null,
			verification_status: "verified",
			website: "https://testorg.example.com",
			certification_document: {
				filename: certFileExists
					? certFilename
					: "seeded-test-certificate.jpg",
				contentType: "image/jpg",
				uploaded_at: new Date(),
				verified: true,
				verified_at: new Date(),
				verified_by: null,
				rejection_reason: null,
			},
		});

		const savedOrganiser = await organiser.save();
		console.log(
			`✅ Created verified organiser profile for: ${savedOrganiserUser.email}`
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

		// Create past event and register the volunteer for it (for certificate testing)
		const pastEvent = new Event({
			organiser_id: savedOrganiser._id,
			name: "Past Charity Run",
			description: "A charity run that has already completed.",
			location: "East Coast Park",
			causes: ["healthcare"],
			max_volunteers: 50,
			registered_count: 1,
			contact_person: "Test Organiser",
			contact_email: "testorganiser1@gmail.com",
			status: "completed",
			is_recurring: false,
			start_datetime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
			end_datetime: new Date(
				Date.now() - 30 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
			), // 3 hours after start
			start_day_of_week: new Date(
				Date.now() - 30 * 24 * 60 * 60 * 1000
			).getDay(),
			created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
		});

		const savedPastEvent = await pastEvent.save();
		console.log(
			`✅ Created past event for certificate testing: "${savedPastEvent.name}"`
		);

		// Register volunteer for the first event
		const firstEvent = createdEvents[0];

		const registration = new EventRegistration({
			user_id: volunteer.user_id,
			event_id: firstEvent._id,
			status: "confirmed",
			signup_date: new Date(),
		});

		await registration.save();

		// Register volunteer for the past event with completed status
		const pastRegistration = new EventRegistration({
			user_id: volunteer.user_id,
			event_id: savedPastEvent._id,
			status: "confirmed",
			signup_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
			attendance_status: "attended",
			check_in_time: new Date(savedPastEvent.start_datetime),
			check_out_time: new Date(savedPastEvent.end_datetime),
			feedback: {
				from_organiser: {
					comment: "Great volunteer, very helpful!",
					rating: 5,
					submitted_at: new Date(
						Date.now() - 29 * 24 * 60 * 60 * 1000
					), // 29 days ago
				},
			},
		});

		await pastRegistration.save();

		// Update event registration count
		await Event.findByIdAndUpdate(firstEvent._id, {
			$inc: { registered_count: 1 },
		});

		console.log(
			`✅ Registered test volunteer for "${firstEvent.name}" event`
		);
		console.log(
			`✅ Registered test volunteer for past event "${savedPastEvent.name}" with attendance`
		);

		console.log("🎉 Seeding complete!");
		console.log("\nTest Account Information:");
		console.log("------------------------");
		console.log(
			"Volunteer: testvolunteer1@gmail.com (password: password) [VERIFIED]"
		);
		console.log(
			"Organiser: testorganiser1@gmail.com (password: password) [VERIFIED]"
		);
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
