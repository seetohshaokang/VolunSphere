// src/helpers/Api.js
// Base API helper for making requests to the backend

const SERVER_PREFIX =
	import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const Api = {
	// Make SERVER_PREFIX available
	SERVER_PREFIX,

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
		return fetch(`${SERVER_PREFIX}/profile`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	updateUserProfile(data) {
		return fetch(`${SERVER_PREFIX}/profile`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			method: "PUT",
			body: data, // FormData for file uploads
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error(`HTTP error! Status: ${res.status}`);
				}
				return res.json(); // Ensure this result is returned
			})
			.then((data) => {
				console.log("Fetched Profile Data:", data);
				return data; // Return the parsed JSON
			})
			.catch((error) => {
				console.error("Error updating profile:", error);
				throw error; // Re-throw the error to be handled in handleSubmit
			});
	},

	deleteUserProfile() {
		return fetch(`${SERVER_PREFIX}/profile`, {
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

	getEventReviews(id) {
		return fetch(`${SERVER_PREFIX}/events/${id}/reviews`);
	},

	// Event signup methods
	signupForEvent(eventId) {
		return fetch(`${SERVER_PREFIX}/events/${eventId}/signup`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	removeEventSignup(eventId) {
		return fetch(`${SERVER_PREFIX}/events/${eventId}/signup`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	// Check if user is signed up for an event
	checkEventSignupStatus(eventId) {
		return fetch(`${SERVER_PREFIX}/events/${eventId}/signup/status`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	createEventReview(eventId, reviewData) {
		return fetch(`${SERVER_PREFIX}/events/${eventId}/reviews`, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			method: "POST",
			body: JSON.stringify(reviewData),
		});
	},

	updateEventReview(eventId, reviewId, reviewData) {
		return fetch(`${SERVER_PREFIX}/events/${eventId}/reviews/${reviewId}`, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			method: "PUT",
			body: JSON.stringify(reviewData),
		});
	},

	// Updated to handle image uploads
	createEvent(data, imageFile) {
		const token = localStorage.getItem("token");

		if (imageFile) {
			// Create FormData for multipart/form-data to support file upload
			const formData = new FormData();

			// Add all form fields to FormData
			Object.keys(data).forEach((key) => {
				// Handle arrays (like causes)
				if (Array.isArray(data[key])) {
					formData.append(key, JSON.stringify(data[key]));
				} else {
					formData.append(key, data[key]);
				}
			});

			// Add the image file
			formData.append("event_image", imageFile);

			// Send multipart request
			return fetch(`${SERVER_PREFIX}/events`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					// Don't set Content-Type when using FormData - browser will set it with boundary
				},
				body: formData,
			});
		} else {
			// Regular JSON request if no file
			return fetch(`${SERVER_PREFIX}/events`, {
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				method: "POST",
				body: JSON.stringify(data),
			});
		}
	},

	// Updated to handle image uploads
	updateEvent(id, data, imageFile) {
		const token = localStorage.getItem("token");

		if (imageFile) {
			// Create FormData for multipart/form-data to support file upload
			const formData = new FormData();

			// Add all form fields to FormData
			Object.keys(data).forEach((key) => {
				// Handle arrays (like causes)
				if (Array.isArray(data[key])) {
					formData.append(key, JSON.stringify(data[key]));
				} else {
					formData.append(key, data[key]);
				}
			});

			// Add the image file
			formData.append("event_image", imageFile);

			// Send multipart request
			return fetch(`${SERVER_PREFIX}/events/${id}`, {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${token}`,
					// Don't set Content-Type when using FormData - browser will set it with boundary
				},
				body: formData,
			});
		} else {
			// Regular JSON request if no file
			return fetch(`${SERVER_PREFIX}/events/${id}`, {
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				method: "PUT",
				body: JSON.stringify(data),
			});
		}
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
		return fetch(`${SERVER_PREFIX}/events/${eventId}/registrations`, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			method: "POST",
		});
	},

	cancelEventRegistration(eventId) {
		return fetch(`${SERVER_PREFIX}/events/${eventId}/registrations`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			method: "DELETE",
		});
	},

	getRegisteredEvents() {
		return fetch(`${SERVER_PREFIX}/profile/events`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	getOrganizedEvents() {
		const token = localStorage.getItem("token");
		console.log("Using token for auth:", token);

		return fetch(`${SERVER_PREFIX}/profile/events`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	reportEvent(eventId, reason) {
		return fetch(`${SERVER_PREFIX}/events/${eventId}/reports`, {
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
			method: "PUT",
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
		return fetch(
			`${SERVER_PREFIX}/admin/volunteers/verifications?${queryString}`,
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			}
		);
	},

	// For volunteer NRIC verification
	updateVerificationStatus(id, verified, reason) {
		return fetch(`${SERVER_PREFIX}/admin/volunteers/${id}/verification`, {
			method: "PUT",
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
			method: "PUT",
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
			method: "PUT",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				status,
				admin_notes: adminNotes,
				resolution_action: resolutionAction,
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
			method: "POST",
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
			method: "PUT",
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
