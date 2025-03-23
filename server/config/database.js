const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./.env.server" });

// Supabase client for interacting with database
const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_KEY
);

// Base user operations (common to all user types)
const baseUserOperations = {
	// Get user by auth_id
	getUserByAuthId: async (authId) => {
		const { data, error } = await supabase
			.from("users")
			.select("*")
			.eq("auth_id", authId)
			.single();
		if (error) throw error;
		return data;
	},

	// Check if email exists
	checkEmailExists: async (email) => {
		const { data, error } = await supabase
			.from("users")
			.select("email")
			.eq("email", email);
		if (error) throw error;
		return data.length > 0;
	},

	// Update basic user profile
	updateBasicUserInfo: async (authId, updateData) => {
		const { data, error } = await supabase
			.from("users")
			.update(updateData)
			.eq("auth_id", authId)
			.select();
		if (error) throw error;
		return data;
	},

	// Delete user
	deleteUser: async (authId) => {
		const { error } = await supabase
			.from("users")
			.delete()
			.eq("auth_id", authId);

		if (error) throw error;
		return { sucess: true };
	},
};

// Volunteer-specific operations
const volunteerOperations = {
	// Create a new volunteer
	createVolunteer: async (userData) => {
		const { data, error } = await supabase
			.from("users")
			.insert([{ ...userData, role: "volunteer" }])
			.select();
		if (error) throw error;
		return data;
	},

	// Get volunteer profile with their skills
	getVolunteerProfile: async (authId) => {
		const { data, error } = await supabase
			.from("users")
			.select("*, volunteer_skills(*)")
			.eq("auth_id", authId)
			.eq("role", "volunteer")
			.single();
		if (error) throw error;
		return data;
	},

	// Update volunteer skills
	updateVolunteerSkills: async (userId, skills) => {
		// First delete existing skills
		await supabase.from("volunteer_skills").delete().eq("user_id", userId);

		// Then insert new skills
		if (skills && skills.length > 0) {
			const skillData = skills.map((skill) => ({
				user_id: userId,
				skill_name: skill,
			}));

			const { data, error } = await supabase
				.from("volunteer_skills")
				.insert(skillData)
				.select();
			if (error) throw error;
			return data;
		}
		return [];
	},

	// Get all events a volunteer has registerd for
	getVolunteerEvents: async (userId) => {
		const { data, error } = await supabase
			.from("event_registrations")
			.select("*, events(*)")
			.eq("user_id", userId);

		if (error) throw error;
		return data;
	},
};

const organiserOperations = {
	// Create a new organiser
	createOrganiser: async (userData) => {
		const { data, error } = await supabase
			.from("users")
			.insert([{ ...userData, role: "organiser" }])
			.select();
		if (error) throw error;
		return data;
	},

	// Get organiser profile with their organisation details
	getOrganiserProfile: async (authId) => {
		const { data, error } = await supabase
			.from("users")
			.select("*, organisation_details(*)")
			.eq("auth_id", authId)
			.eq("role", "organiser")
			.single();
		if (error) throw error;
		return data;
	},

	// Update organisation details
	updateOrganisationDetails: async (userId, details) => {
		// Check if details already exist
		const { data: existingData } = await supabase
			.from("organisation_details")
			.select("*")
			.eq("user_id", userId)
			.single();
		if (existingData) {
			// Update existing details
			const { data, error } = await supabase
				.from("organisation_details")
				.update(details)
				.eq("user_id", userId)
				.select();
			if (error) throw error;
			return data;
		} else {
			// Create new details
			const { data, error } = await supabase
				.from("organisation_details")
				.insert([{ ...details, user_id: userId }])
				.select();

			if (error) throw error;
			return data;
		}
	},

	// Get all events created by an organiser
	getOrganiserEvents: async (userId) => {
		const { data, error } = await supabase
			.from("event")
			.select("*")
			.eq("orgnaiser_id", userId);
		if (error) throw error;
		return data;
	},
};

// Event operations (shared by all users, but with different permissions)
const eventOperations = {
	// Create a new event
	createEvent: async (eventData) => {
		const { data, error } = await supabase
			.from("events")
			.insert([eventData])
			.select();

		if (error) throw error;
		return data;
	},

	// Get event by ID
	getEventById: async (id) => {
		const { data, error } = await supabase
			.from("events")
			.select("*")
			.eq("id", id)
			.single();
		if (error) throw error;
		return data;
	},

	updateEvent: async (id, updateData) => {
		const { data, error } = await supabase
			.from("events")
			.update(updateData)
			.eq("id", id)
			.select();
		if (error) throw error;
		return data;
	},

	deleteEvent: async (id) => {
		const { error } = await supabase.from("events").delete().eq("id", id);

		if (error) throw error;
		return { success: true };
	},

	searchEvents: async (filters) => {
		let query = supabase.from("events").select("*");

		// Apply search term if provided
		if (filters.searchTerm) {
			query = query.or(
				`name.ilike.%${filters.searchTerm}%, description.ilike.%${filters.searchTerm}%`
			);
		}

		// Apply category filter if provided
		if (filters.category) {
			query.query.eq("cause", filters.category);
		}

		// Apply location filter if provided
		if (filters.location) {
			query.query.eq("location", filters.location);
		}

		// Apply date filters if provided
		if (filters.dateStart) {
			query = query.gte("start_date", filters.dateStart);
		}

		if (filters.dateEnd) {
			query = query.lte("end_date", filters.dateEnd);
		}

		const { ddata, error } = await query;
		if (error) throw error;
		return data;
	},

	// Get event registration
	getEventRegistrations: async (eventId) => {
		const { data, error } = await supabase
			.from("event_registrations")
			.select("*, users(*)")
			.eq("event_id", eventId);
		if (error) throw error;
		return data;
	},
};

// Event registration operations
const registrationOperations = {
	// Register a volunteer for an event
	registerForEvent: async (userId, eventId) => {
		const { data, error } = await supabase
			.from("event_registrations")
			.insert([
				{ user_id: userId, event_id: eventId, status: "registered" },
			])
			.select();
		if (error) throw error;
		return data;
	},

	// Cancel a registration
	cancelRegistration: async (userId, eventId) => {
		const { error } = await supabase
			.from("event_registrations")
			.delete()
			.match({ user_id: userId, event_id: eventId });
		if (error) throw error;
		return { success: true };
	},
};

// Reporting operations
const reportOperations = {
	// Report an event
	reportEvent: async (userId, eventId, reason) => {
		const { data, error } = await supabase
			.from("event_reports")
			.insert([
				{
					user_id: userId,
					event_id: eventId,
					reason,
					status: "pending",
				},
			])
			.select();
		if (error) throw error;
		return data;
	},
};

const adminOperations = {
    // User management operations
    getAllUsers: async (role = null) => {
        let query = supabase.from('users').select('*');
        
        if (role) {
            query = query.eq('role', role);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },
    
    banUser: async (userId, reason, adminId) => {
        // First update the user record with banned status
        const { data, error } = await supabase
            .from('users')
            .update({ 
                status: 'banned',
                ban_reason: reason,
				banned_by: adminId
            })
            .eq('user_id', userId)
            .select();
            
        if (error) throw error;
        return data;
    },
    
    verifyOrganizer: async (organizerId, adminId) => {
        const { data, error } = await supabase
            .from('users')
            .update({ 
                status: "verified",
            })
            .eq('user_id', organizerId)
            .eq('role', 'organiser')
            .select();
            
        if (error) throw error;
        return data;
    },
    
    // Report management operations
	getAllReports: async (status = null) => {
		let query = supabase
			.from('reports')
			.select(`
				*,
				users!user_id(name, email),
				events!event_id(name, description)
			`);
		
		if (status) {
			query = query.eq('status', status);
		}
		
		const { data, error } = await query.order('reported_date', { ascending: false });
		if (error) throw error;
		return data;
	},

    resolveReport: async (reportId, adminId) => {
        const { data, error } = await supabase
            .from('reports')
            .update({
                status: 'resolved',
                resolved_by: adminId,
                resolved_date: new Date()
            })
            .eq('id', reportId)
            .select();
            
        if (error) throw error;
        return data;
    },	
	//simple remove event
	removeEvent: async (eventId, reason, adminId) => {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', eventId);
            
        if (error) throw error;
        return { success: true };
    },
};

module.exports = {
	supabase,
	baseUserOperations,
	volunteerOperations,
	organiserOperations,
	eventOperations,
	registrationOperations,
	reportOperations,
	adminOperations
};
