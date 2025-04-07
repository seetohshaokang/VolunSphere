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

		// *** ADD ADMIN USER ***
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
				"system_settings"
			],
			last_login: new Date(),
			reports_handled: 0
		});

		await admin.save();
		console.log(`✅ Created admin profile for: ${savedAdminUser.email}`);
		// *** END ADMIN USER ADDITION ***

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
      volunteer_id: volunteer._id,
      event_id: firstEvent._id,
      status: "registered",
      registration_date: new Date(),
    });

    await registration.save();

    // Update event registration count
    await Event.findByIdAndUpdate(firstEvent._id, {
      $inc: { registered_count: 1 },
    });

    console.log(`✅ Registered test volunteer for "${firstEvent.name}" event`);

<<<<<<< HEAD
    console.log("🎉 Seeding complete!");
=======
		console.log("🎉 Seeding complete!");
		console.log("\nTest Account Information:");
		console.log("------------------------");
		console.log("Volunteer: testvolunteer1@gmail.com (password: password)");
		console.log("Organiser: testorganiser1@gmail.com (password: password)");
		console.log("Admin: admin@volunsphere.com (password: password)");
		console.log("------------------------");
>>>>>>> b950c92c20aa5c4c129be1836c313129e71b32a6

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