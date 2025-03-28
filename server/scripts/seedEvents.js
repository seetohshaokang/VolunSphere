// seedEvents.js
const { supabase } = require("./config/database");
require("dotenv").config({ path: "./.env.server" });

async function seedEvents() {
	try {
		console.log("Seeding events database...");

		// Get a random organiser ID to use for the events
		const { data: organisers, error: organiserError } = await supabase
			.from("users")
			.select("id")
			.eq("role", "organiser")
			.limit(1);

		if (organiserError) {
			throw organiserError;
		}

		if (!organisers || organisers.length === 0) {
			throw new Error(
				"No organiser found. Please create an organiser account first."
			);
		}

		const organiser_id = organisers[0].id;

		// Sample event data
		const events = [
			{
				name: "Beach Cleanup Drive",
				duration: "3 hours",
				description:
					"Join us for a community beach cleanup event. Help keep our beaches clean and protect marine life.",
				cause: "Environment",
				location: "Changi Beach",
				organiser_id,
				start_date: "2025-04-15",
				end_date: "2025-04-15",
				status: "active",
				start_time: "09:00:00",
				end_time: "12:00:00",
				is_recurring: false,
				max_volunteers: 20,
			},
			{
				name: "Elderly Home Visit",
				duration: "2 hours",
				description:
					"Spend time with elderly residents at the retirement home. Activities include reading, playing games, and general companionship.",
				cause: "Healthcare",
				location: "Sunshine Retirement Home",
				organiser_id,
				start_date: "2025-04-22",
				end_date: "2025-04-22",
				status: "active",
				start_time: "14:00:00",
				end_time: "16:00:00",
				is_recurring: false,
				max_volunteers: 15,
			},
			{
				name: "Food Distribution Drive",
				duration: "4 hours",
				description:
					"Help pack and distribute food packages to families in need in our community.",
				cause: "Social Services",
				location: "Central Community Center",
				organiser_id,
				start_date: "2025-04-10",
				end_date: "2025-04-10",
				status: "active",
				start_time: "10:00:00",
				end_time: "14:00:00",
				is_recurring: false,
				max_volunteers: 25,
			},
			{
				name: "Tree Planting Initiative",
				duration: "5 hours",
				description:
					"Be part of our city's greening efforts by planting trees in local parks.",
				cause: "Environment",
				location: "City Park",
				organiser_id,
				start_date: "2025-05-05",
				end_date: "2025-05-05",
				status: "active",
				start_time: "08:00:00",
				end_time: "13:00:00",
				is_recurring: false,
				max_volunteers: 30,
			},
			{
				name: "Animal Shelter Support",
				duration: "3 hours",
				description:
					"Help walk, groom, and care for shelter animals awaiting their forever homes.",
				cause: "Animal Welfare",
				location: "Happy Tails Shelter",
				organiser_id,
				start_date: "2025-04-18",
				end_date: "2025-04-18",
				status: "active",
				start_time: "13:00:00",
				end_time: "16:00:00",
				is_recurring: false,
				max_volunteers: 12,
			},
			{
				name: "Literacy Program",
				duration: "2 hours",
				description:
					"Volunteer to read with children and support literacy skills development.",
				cause: "Education",
				location: "Public Library",
				organiser_id,
				start_date: "2025-04-25",
				end_date: "2025-04-25",
				status: "active",
				start_time: "16:00:00",
				end_time: "18:00:00",
				is_recurring: true,
				recurrence_pattern: "weekly",
				recurrence_day: 5, // Friday
				max_volunteers: 10,
			},
			{
				name: "Community Garden Maintenance",
				duration: "4 hours",
				description:
					"Help maintain the community garden by planting, weeding, and harvesting produce that will be donated to local food banks.",
				cause: "Environment",
				location: "Urban Garden Project",
				organiser_id,
				start_date: "2025-05-15",
				end_date: "2025-05-15",
				status: "active",
				start_time: "09:00:00",
				end_time: "13:00:00",
				is_recurring: true,
				recurrence_pattern: "monthly",
				recurrence_day: 15, // 15th of the month
				max_volunteers: 15,
			},
			{
				name: "Youth Mentorship Program",
				duration: "3 hours",
				description:
					"Mentor disadvantaged youth through activities and educational support to help build confidence and skills.",
				cause: "Education",
				location: "Youth Development Center",
				organiser_id,
				start_date: "2025-04-20",
				end_date: "2025-04-20",
				status: "active",
				start_time: "15:00:00",
				end_time: "18:00:00",
				is_recurring: true,
				recurrence_pattern: "weekly",
				recurrence_day: 6, // Saturday
				max_volunteers: 8,
			},
			{
				name: "Homeless Shelter Meal Service",
				duration: "3 hours",
				description:
					"Prepare and serve meals at the local homeless shelter.",
				cause: "Social Services",
				location: "Hope Shelter",
				organiser_id,
				start_date: "2025-04-12",
				end_date: "2025-04-12",
				status: "active",
				start_time: "17:00:00",
				end_time: "20:00:00",
				is_recurring: false,
				max_volunteers: 10,
			},
			{
				name: "Neighborhood Cleanup",
				duration: "4 hours",
				description:
					"Join neighbors in cleaning up litter and beautifying our local streets and parks.",
				cause: "Community Development",
				location: "Various neighborhoods",
				organiser_id,
				start_date: "2025-04-30",
				end_date: "2025-04-30",
				status: "active",
				start_time: "09:00:00",
				end_time: "13:00:00",
				is_recurring: false,
				max_volunteers: 25,
			},
		];

		// Insert the events
		const { data, error } = await supabase
			.from("events")
			.insert(events)
			.select();

		if (error) {
			throw error;
		}

		console.log(`Successfully seeded ${data.length} events!`);
		console.log(data);
	} catch (error) {
		console.error("Error seeding events:", error);
	}
}

// Execute the function
seedEvents();
