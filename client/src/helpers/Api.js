const SERVER_PREFIX = import.meta.env.VITE_API_URL + "/api" || "http://localhost:8000";

const Api = {
	testConnection() {
		return fetch(`${SERVER_PREFIX}/test/connection`)
			.then((res) => res.json())
			.catch((error) => {
				console.error("Test connection error:", error);
				throw error;
			});
	},

	// Auth-related methods
	loginUser(credentials) {
		return fetch(`${SERVER_PREFIX}/auth/login`, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(credentials),
		});
	},

	registerUser(userData) {
		return fetch(`${SERVER_PREFIX}/auth/signup`, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(userData),
		});
	},

	forgotPassword(data) {
		return fetch(`${SERVER_PREFIX}/auth/forgot-password`, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(data),
		});
	},

	logoutUser() {
		return fetch(`${SERVER_PREFIX}/auth/logout`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			method: "POST",
		});
	},

	// Profile-related methods
	getUserProfile() {
		return fetch(`${SERVER_PREFIX}/profile/readProfile`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	updateUserProfile(data) {
		// For form data with file uploads
		return fetch(`${SERVER_PREFIX}/profile/updateProfile`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			method: "POST",
			body: data, // FormData for file uploads
		});
	},

	deleteUserProfile() {
		return fetch(`${SERVER_PREFIX}/profile/deleteProfile`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			method: "DELETE",
		});
	},

	// Event-related methods
	getAllEvents() {
		return fetch(`${SERVER_PREFIX}/events`);
	},

	getEvent(id) {
		return fetch(`${SERVER_PREFIX}/events/${id}`);
	},

	createEvent(data) {
		return fetch(`${SERVER_PREFIX}/events`, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			method: "POST",
			body: JSON.stringify(data),
		});
	},

	updateEvent(id, data) {
		return fetch(`${SERVER_PREFIX}/events/${id}`, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			method: "PUT",
			body: JSON.stringify(data),
		});
	},

	deleteEvent(id) {
		return fetch(`${SERVER_PREFIX}/events/${id}`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			method: "DELETE",
		});
	},

	registerForEvent(eventId) {
		return fetch(`${SERVER_PREFIX}/events/${eventId}/register`, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			method: "POST",
		});
	},

	cancelEventRegistration(eventId) {
		return fetch(`${SERVER_PREFIX}/events/${eventId}/register`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			method: "DELETE",
		});
	},

	getRegisteredEvents() {
		return fetch(`${SERVER_PREFIX}/events/user/registered`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	getOrganizedEvents() {
		const token = localStorage.getItem("token");
		console.log("Using token for auth:", token);

		return fetch(`${SERVER_PREFIX}/events/user/organized`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	reportEvent(eventId, reason) {
		return fetch(`${SERVER_PREFIX}/events/${eventId}/report`, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			method: "POST",
			body: JSON.stringify({ reason }),
		});
	},

	getRecommendedEvents() {
		return fetch(`${SERVER_PREFIX}/events/recommendations`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	getAdminDashboardStats() {
		return fetch(`${SERVER_PREFIX}/admin/dashboard`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	// User management
	getAdminUsers(params = {}) {
		const queryString = new URLSearchParams(params).toString();
		return fetch(`${SERVER_PREFIX}/admin/users?${queryString}`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	getUserById(id) {
		return fetch(`${SERVER_PREFIX}/admin/users/${id}`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	updateUserStatus(id, status, reason) {
		return fetch(`${SERVER_PREFIX}/admin/users/${id}/status`, {
			method: 'PUT',
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			body: JSON.stringify({ status, reason }),
		});
	},

	// Verification management
	getPendingVerifications(params = {}) {
		const queryString = new URLSearchParams(params).toString();
		return fetch(`${SERVER_PREFIX}/admin/volunteers/verifications?${queryString}`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	// For volunteer NRIC verification
	updateVerificationStatus(id, verified, reason) {
		return fetch(`${SERVER_PREFIX}/admin/volunteers/${id}/verification`, {
			method: 'PUT',
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			body: JSON.stringify({ verified, reason }),
		});
	},

	// For organiser account verification
	updateOrganiserVerification(id, status, reason) {
		return fetch(`${SERVER_PREFIX}/admin/organisers/${id}/verification`, {
			method: 'PUT',
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			body: JSON.stringify({ status, reason }),
		});
	},

	// Reports management
	getAdminReports(params = {}) {
		const queryString = new URLSearchParams(params).toString();
		return fetch(`${SERVER_PREFIX}/admin/reports?${queryString}`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	getAdminReportById(id) {
		return fetch(`${SERVER_PREFIX}/admin/reports/${id}`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	updateReportStatus(id, status, adminNotes, resolutionAction) {
		return fetch(`${SERVER_PREFIX}/admin/reports/${id}`, {
			method: 'PUT',
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				status,
				admin_notes: adminNotes,
				resolution_action: resolutionAction
			}),
		});
	},

	// Admin actions
	getAdminActions(params = {}) {
		const queryString = new URLSearchParams(params).toString();
		return fetch(`${SERVER_PREFIX}/admin/actions?${queryString}`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	createAdminAction(data) {
		return fetch(`${SERVER_PREFIX}/admin/actions`, {
			method: 'POST',
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			body: JSON.stringify(data),
		});
	},

	// Admin event management
	getAdminEvents(params = {}) {
		const queryString = new URLSearchParams(params).toString();
		return fetch(`${SERVER_PREFIX}/admin/events?${queryString}`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	getAdminEventById(id) {
		return fetch(`${SERVER_PREFIX}/admin/events/${id}`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	updateEventStatus(id, status, reason) {
		return fetch(`${SERVER_PREFIX}/admin/events/${id}/status`, {
			method: 'PUT',
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			body: JSON.stringify({ status, reason }),
		});
	},
};

export default Api;
