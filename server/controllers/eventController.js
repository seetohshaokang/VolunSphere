/**
 * Event Controller
 * Handles CRUD operations for volunteer events
 */

const {
	eventOperations,
	registrationOperations,
	baseUserOperations,
	volunteerOperations,
	organiserOperations,
	reportOperations,
} = require("../config/database");

/**
 * Create new event
 * @route POST /events
 */
const createEvent = async (req, res) => {
	const {
		name,
		duration,
		description,
		cause,
		location,
		start_date,
		end_date,
	} = req.body;
	const organiser_id = req.user.id; // From auth middleware

	try {
		// Input validation
		if (
			!name ||
			!description ||
			!cause ||
			!location ||
			!start_date ||
			!end_date
		) {
			return res
				.status(400)
				.json({ message: "Required fields are missing" });
		}

		// Additional validation
		const startDate = new Date(start_date);
		const endDate = new Date(end_date);

		if (endDate < startDate) {
			return res
				.status(400)
				.json({ message: "End date cannot be before start date" });
		}

		// Create the event
		const eventData = {
			name,
			duration,
			description,
			cause,
			location,
			start_date,
			end_date,
			organiser_id,
			status: "active", // Default status
		};

		const data = await eventOperations.createEvent(eventData);

		return res.status(201).json({
			message: "Event created successfully",
			data: data[0],
		});
	} catch (error) {
		console.error("Error creating event:", error);
		return res.status(500).json({
			message: "Error creating event",
			error: error.message,
		});
	}
};

/**
 *
 * Get all events
 * Optional query parameters for filtering
 * @route GET /events
 */

const getEvents = async (req, res) => {
	try {
		// Extract query parameters for filtering
		const filters = {
			searchTerm: req.query.search,
			category: req.query.category,
			location: req.query.location,
			dateStart: req.query.dateStart,
			dateEnd: req.query.dateEnd,
		};

		// Filter out undefined values
		Object.keys(filters).forEach((key) => {
			if (filters[key] === undefined) {
				delete filters[key];
			}
		});

		// If there are filters, use search function
		const data =
			Object.keys(filters).length > 0
				? await eventOperations.searchEvents(filters)
				: await eventOperations.getAllEvents();

		return res.status(200).json(data);
	} catch (error) {
		console.error("Error fetching events:", error);
		return res.status(500).json({
			message: "Error fetching events",
			error: error.message,
		});
	}
};

/**
 * Get event by ID
 * @route GET /events/:id
 */
const getEventById = async (req, res) => {
	const { id } = req.params;

	try {
		if (!id || isNaN(parseInt(id))) {
			return res
				.status(400)
				.json({ message: "Valid event ID is required" });
		}
		const data = await eventOperations.getEventById(parseInt(id));

		if (!data) {
			return res.status(404).json({ message: "Event not found" });
		}
		return res.status(200).json(data);
	} catch (error) {
		console.error(`Error fetching event ${id}:`, error);
		return res.status(500).json({
			message: "Error fetching event",
			error: error.message,
		});
	}
};

/**
 * Update an event
 * @route PUT /events/:id
 */
const updateEvent = async (req, res) => {
	const { id } = req.params;
	const {
		name,
		duration,
		description,
		cause,
		location,
		start_date,
		end_date,
		status,
	} = req.body;
	const userId = req.user.id; // From auth middleware

	try {
		//Validate event ID
		if (!id || isNaN(parseInt(id))) {
			return res
				.status(400)
				.json({ message: "Valid event ID is required" });
		}

		// Check if event exists and user has permission
		const event = await eventOperations.getEventById(parseInt(id));

		if (!event) {
			return res.status(400).json({ message: "Event not found" });
		}

		// Check ownership (organiser can only update their own events)
		// Admins would bypass this check with a separate route
		if (event.organiser_id !== userId) {
			return res
				.status(403)
				.json({ message: "Not authorized to update this event" });
		}

		// Prepare update data
		const updateData = {};
		if (name !== undefined) updateData.name = name;
		if (duration !== undefined) updateData.duration = duration;
		if (description !== undefined) updateData.description = description;
		if (cause !== undefined) updateData.cause = cause;
		if (location !== undefined) updateData.location = location;
		if (start_date !== undefined) updateData.start_date = start_date;
		if (end_date !== undefined) updateData.end_date = end_date;
		if (status !== undefined) updateData.status = status;

		// Validate dates if both are provided
		if (updateData.start_date && updateData.end_date) {
			const startDate = new Date(updateData.start_date);
			const endDate = new Date(updateData.end_date);

			if (endDate < startDate) {
				return res
					.status(400)
					.json({ message: "End date cannot be before start date" });
			}
		}

		// Ensure there's something to update
		if (Object.keys(updateData).length === 0) {
			return res
				.status(400)
				.json({ message: "No fields provided for update" });
		}

		// Update the event
		const data = await eventOperations.updateEvent(
			parseInt(id),
			updateData
		);

		return res.status(200).json({
			message: "Event updated successfully",
			data: data[0],
		});
	} catch (error) {
		console.error(`Error updating event ${id}:`, error);
		return res.status(500).json({
			message: "Error updating event",
			error: error.message,
		});
	}
};

/**
 * Cancel a registration for an event
 * @route DELETE /events/:id
 */
const deleteEvent = async (req, res) => {
	const { id } = req.params;
	const userId = req.user.id; // From auth middleware

	try {
		//Validate event ID
		if (!id || isNaN(parseInt(id))) {
			return res
				.status(400)
				.json({ message: "Valid event ID is required" });
		}

		// Check if event exists and user has permission
		const event = await eventOperations.getEventById(parseInt(id));

		if (!event) {
			return res.status(404).json({ message: "Event not found" });
		}

		// Check ownership (organiser can only delete their own events)
		// Admins would bypass this check with a separate route
		if (event.organiser_id !== userId) {
			return res
				.status(403)
				.json({ message: "Not authorised to delete this event" });
		}

		// Delete the event
		await eventOperations.deleteEvent(parseInt(id));

		return res.status(200).json({ message: "Event deleted successfully" });
	} catch (error) {
		console.error(`Error deleting event ${id}:`, error);
		return res.status(500).json({
			message: "Error deleting event",
			error: error.message,
		});
	}
};

/**
 * Register a volunteer for an event
 * @route POST /events/:id/register
 */
const registerForEvent = async (req, res) => {
	const { id: eventId } = req.params;
	const userId = req.user.id; // From auth middleware

	try {
		// Validate event ID
		if (!eventId || isNaN(parseInt(eventId))) {
			return res
				.status(400)
				.json({ message: "Valid event ID is required" });
		}

		// Check if event exists and is active
		const event = await eventOperations.getEventById(parseInt(eventId));

		if (!event) {
			return res.status(404).json({ message: "Event not found" });
		}

		if (event.status !== "active") {
			return res.status(400).json({
				message: `Cannot register for an event with status: ${event.status}`,
			});
		}

		// Check if already registered
		const registrations = await eventOperations.getEventRegistrations(
			parseInt(eventId)
		);
		const isRegistered = registrations.some(
			(reg) => reg.user_id === userId
		);

		if (isRegistered) {
			return res
				.status(400)
				.json({ message: "Already registered for this event" });
		}

		// Check if event is at capacity
		if (
			event.max_volunteers &&
			registrations.length >= event.max_volunteers
		) {
			return res
				.status(400)
				.json({ message: "Event has reached maximum capacity" });
		}

		// Register for the event
		const data = await registrationOperations.registerForEvent(
			userId,
			parseInt(eventId)
		);

		return res.status(200).json({
			message: "Successfully registered for event",
			data: data[0],
		});
	} catch (error) {
		console.error(`Error registering for event ${eventId}:`, error);
		return res.status(500).json({
			message: "Error registering for event",
			error: error.message,
		});
	}
};

/**
 * Cancel a registration for an event
 * @route DELETE /events/:id/register
 */
const cancelRegistration = async (req, res) => {
	const { id: eventId } = req.params;
	const userId = req.user.id; // From auth middleware

	try {
		// Validate event ID
		if (!eventId || isNaN(parseInt(eventId))) {
			return res
				.status(400)
				.json({ message: "Valid event ID is required" });
		}

		// Check if event exists
		const event = await eventOperations.getEventById(parseInt(eventId));

		if (!event) {
			return res.status(404).json({ message: "Event not found" });
		}

		// Check if registered
		const registrations = await eventOperations.getEventRegistrations(
			parseInt(eventId)
		);
		const isRegistered = registrations.some(
			(reg) => reg.user_id === userId
		);

		if (!isRegistered) {
			return res
				.status(400)
				.json({ message: "Not registered for this event" });
		}

		// Cancel registration
		await registrationOperations.cancelRegistration(
			userId,
			parseInt(eventId)
		);

		return res
			.status(200)
			.json({ message: "Registration cancelled successfully" });
	} catch (error) {
		console.error(
			`Error cancelling registration for event ${eventId}:`,
			error
		);
		return res.status(500).json({
			message: "Error cancelling registration",
			error: error.message,
		});
	}
};

/**
 * Get events that a volunteer has registered for
 * @route GET /events/registered
 */
const getRegisteredEvents = async (req, res) => {
	const user = req.user; // From auth middeware

	try {
		// First check if the user is a volunteer
		const userData = await baseUserOperations.getUserByAuthId(user.id);

		if (!userData) {
			return res.status(404).json({ error: "User profile not found" });
		}

		if (userData.role !== "volunteer") {
			return res
				.status(403)
				.json({ message: "Only volunteers can access this endpoint" });
		}

		const events = await volunteerOperations.getVolunteerEvents(
			userData.id
		);
		return res.status(200).json(events);
	} catch (error) {
		console.error("Error fetching registered events:", error);
		return res.status(500).json({
			error: "Failed to fetch registered events",
			details: error.message,
		});
	}
};

/**
 * Get events that an organizer has created
 * @route GET /events/organized
 */
const getOrganizedEvents = async (req, res) => {
	const user = req.user; // From auth middleware

	try {
		// Use auth_id directly since that's what we store in events table
		if (!user || !user.id) {
			return res.status(400).json({
				error: "User ID missing from request",
			});
		}

		console.log("Getting events for organiser with ID:", user.id);
		const events = await organiserOperations.getOrganiserEvents(user.id);
		return res.status(200).json(events);
	} catch (error) {
		console.error("Error fetching organized events:", error);
		return res.status(500).json({
			error: "Failed to fetch organised events",
			details: error.message,
		});
	}
};

/**
 * Report an event
 * @route POST /reports/events/:id
 */
const reportEvent = async (req, res) => {
	const { id: eventId } = req.params;
	const { reason } = req.body;
	const userId = req.user.id;

	try {
		// Validate inputs
		if (!eventId || isNaN(parseInt(eventId))) {
			return res
				.status(400)
				.json({ message: "Valid event ID is required" });
		}

		if (!reason) {
			return res
				.status(400)
				.json({ message: "Reason for report is required" });
		}

		// Check if event exists
		const event = await eventOperations.getEventById(parseInt(eventId));
		if (!event) {
			return res.status(404).json({ message: "Event not found" });
		}

		// Create the report
		const report = await reportOperations.reportEvent(
			userId,
			parseInt(eventId),
			reason
		);

		return res.status(201).json({
			message: "Event reported successfully",
			data: report[0],
		});
	} catch (error) {
		console.error("Error reporting event:", error);
		return res.status(500).json({
			message: "Error reporting event",
			error: error.message,
		});
	}
};

const getRecommendedEvents = async (req, res) => {
	try {
		const userId = req.user.id; // Assuming user info is attached by auth middleware
		const limit = parseInt(req.query.limit) || 10;

		const recommendations =
			await recommendationService.getRecommendedEvents(userId, limit);

		res.status(200).json({
			success: true,
			data: recommendations,
		});
	} catch (error) {
		console.error("Error getting recommended events:", error);
		res.status(500).json({
			success: false,
			error: "Failed to get recommended events",
		});
	}
};

module.exports = {
	createEvent,
	getEvents,
	getEventById,
	updateEvent,
	deleteEvent,
	registerForEvent,
	cancelRegistration,
	getRegisteredEvents,
	getOrganizedEvents,
	reportEvent,
	getRecommendedEvents,
};
