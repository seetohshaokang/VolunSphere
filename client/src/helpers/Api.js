// src/helpers/Api.js
// Base API helper for making requests to the backend

const SERVER_PREFIX =
	import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const Api = {
	// Make SERVER_PREFIX available
	SERVER_PREFIX,
	baseUrl: SERVER_PREFIX,

	//===============================================
	// COMMON USER METHODS (Auth & Profile)
	//===============================================

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
		const endpoint =
			userData.role === "volunteer"
				? `${SERVER_PREFIX}/auth/register/volunteer`
				: `${SERVER_PREFIX}/auth/register/organiser`;

		return fetch(endpoint, {
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

	//===============================================
	// VOLUNTEER METHODS
	//===============================================

	// Upload NRIC for verification
	uploadNRIC(formData) {
		return fetch(`${SERVER_PREFIX}/profile/nric`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
				// Don't set Content-Type when using FormData - browser will set it with boundary
			},
			body: formData,
		});
	},

	// Event signup methods for volunteers
	registerForEvent(eventId) {
		return fetch(`${SERVER_PREFIX}/events/${eventId}/signup`, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			method: "POST",
		});
	},

	cancelEventRegistration(eventId) {
		return fetch(`${SERVER_PREFIX}/events/${eventId}/signup`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			method: "DELETE",
		});
	},

	removeEventSignup(eventId, data = {}) {
		const requestOptions = {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		};

		// If we have registration ID or reason, add them to the request body
		if (data.registrationId || data.reason) {
			requestOptions.body = JSON.stringify(data);
		}

		return fetch(
			`${SERVER_PREFIX}/events/${eventId}/signup`,
			requestOptions
		);
	},

	getRegisteredEvents() {
		return fetch(`${SERVER_PREFIX}/profile/events`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	// Event review methods
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

	// Report an event
	reportEvent(eventId, reason, details) {
		return fetch(`${SERVER_PREFIX}/events/${eventId}/reports`, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			method: "POST",
			body: JSON.stringify({ reason, details }),
		});
	},

	//===============================================
	// ORGANISER METHODS
	//===============================================

	// Get events organized by current user
	getOrganizedEvents() {
		const token = localStorage.getItem("token");
		console.log("Using token for auth:", token);

		return fetch(`${SERVER_PREFIX}/profile/events`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	// Create an event
	createEvent(data, imageFile) {
		const token = localStorage.getItem("token");

		// Create a copy of the data to modify
		const eventData = { ...data };

		// Handle recurring event data formatting
		if (eventData.is_recurring) {
			// Format recurrence_time from separate fields if they exist
			if (
				eventData.recurrence_time_start &&
				eventData.recurrence_time_end
			) {
				eventData.recurrence_time = {
					start: eventData.recurrence_time_start,
					end: eventData.recurrence_time_end,
				};

				// Clean up temporary fields
				delete eventData.recurrence_time_start;
				delete eventData.recurrence_time_end;
			}
		} else {
			// For non-recurring events, we don't need the recurrence fields
			delete eventData.recurrence_pattern;
			delete eventData.recurrence_days;
			delete eventData.recurrence_start_date;
			delete eventData.recurrence_end_date;
			delete eventData.recurrence_time;
		}

		if (imageFile) {
			// Create FormData for multipart/form-data to support file upload
			const formData = new FormData();

			// Add all form fields to FormData
			Object.keys(eventData).forEach((key) => {
				// Handle arrays and objects (like recurrence_days and recurrence_time)
				if (
					Array.isArray(eventData[key]) ||
					(typeof eventData[key] === "object" &&
						eventData[key] !== null)
				) {
					formData.append(key, JSON.stringify(eventData[key]));
				} else {
					formData.append(key, eventData[key]);
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
				body: JSON.stringify(eventData),
			});
		}
	},

	// Update an event
	updateEvent(id, data, imageFile) {
		const token = localStorage.getItem("token");

		// Create a copy of the data to modify
		const eventData = { ...data };

		// Handle recurring event data formatting
		if (eventData.is_recurring) {
			// Format recurrence_time from separate fields if they exist
			if (
				eventData.recurrence_time_start &&
				eventData.recurrence_time_end
			) {
				eventData.recurrence_time = {
					start: eventData.recurrence_time_start,
					end: eventData.recurrence_time_end,
				};

				// Clean up temporary fields
				delete eventData.recurrence_time_start;
				delete eventData.recurrence_time_end;
			}
		} else {
			// For non-recurring events, we don't need the recurrence fields
			delete eventData.recurrence_pattern;
			delete eventData.recurrence_days;
			delete eventData.recurrence_start_date;
			delete eventData.recurrence_end_date;
			delete eventData.recurrence_time;
		}

		if (imageFile) {
			// Create FormData for multipart/form-data to support file upload
			const formData = new FormData();

			// Add all form fields to FormData
			Object.keys(eventData).forEach((key) => {
				// Handle arrays and objects (like recurrence_days and recurrence_time)
				if (
					Array.isArray(eventData[key]) ||
					(typeof eventData[key] === "object" &&
						eventData[key] !== null)
				) {
					formData.append(key, JSON.stringify(eventData[key]));
				} else {
					formData.append(key, eventData[key]);
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
				body: JSON.stringify(eventData),
			});
		}
	},

	// Delete an event
	deleteEvent(id) {
		return fetch(`${SERVER_PREFIX}/events/${id}`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			method: "DELETE",
		});
	},

	// Get volunteers for an event
	getEventVolunteers(eventId) {
		console.log(
			`Fetching volunteers from: ${SERVER_PREFIX}/events/${eventId}/volunteers`
		);

		const token = localStorage.getItem("token");

		return fetch(`${SERVER_PREFIX}/events/${eventId}/volunteers`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		})
			.then(async (response) => {
				console.log("Volunteers response status:", response.status);

				// For successful responses, try to parse as JSON
				if (response.ok) {
					try {
						const contentType =
							response.headers.get("content-type");
						if (
							contentType &&
							contentType.includes("application/json")
						) {
							const data = await response.json();
							console.log(
								"Successfully parsed JSON response:",
								data
							);
							return data;
						} else {
							console.warn(
								"Response not JSON, content type:",
								contentType
							);
							// Try to parse anyway in case Content-Type is misconfigured
							try {
								const data = await response.json();
								console.log(
									"Successfully parsed JSON despite content type:",
									data
								);
								return data;
							} catch (parseError) {
								console.error(
									"Failed to parse response as JSON:",
									parseError
								);
								const text = await response.text();
								console.log(
									"Response text:",
									text.substring(0, 200) + "..."
								);
								return { registrations: [] };
							}
						}
					} catch (err) {
						console.error("Error handling response:", err);
						return { registrations: [] };
					}
				} else {
					// For error responses
					console.error(
						`Error response: ${response.status} ${response.statusText}`
					);
					return { registrations: [] };
				}
			})
			.catch((error) => {
				console.error("Network or other error:", error);
				return { registrations: [] };
			});
	},

	// Registration management
	checkInRegistration(registrationId) {
		console.log(`API: Checking in registration ${registrationId}`);
		return fetch(
			`${SERVER_PREFIX}/registrations/${registrationId}/check-in`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			}
		);
	},

	checkOutRegistration(registrationId) {
		console.log(
			`API: Checking out/resetting registration ${registrationId}`
		);
		return fetch(
			`${SERVER_PREFIX}/registrations/${registrationId}/check-out`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			}
		);
	},
	resetCheckInStatus(registrationId) {
		console.log(
			`API: Resetting check-in for registration ${registrationId}`
		);
		return fetch(`${SERVER_PREFIX}/registrations/${registrationId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				// Reset these fields to remove check-in status
				check_in_time: null,
				check_out_time: null,
				attendance_status: "not_attended",
				status: "confirmed", // Reset the status back to confirmed from attended
			}),
		});
	},

	// Update the toggleRegistrationStatus method to use the correct approach:
	toggleRegistrationStatus(registrationId, currentStatus) {
		// If currentStatus is "attended", we need to undo the check-in; otherwise, we check in
		const endpoint =
			currentStatus === "attended"
				? `${SERVER_PREFIX}/registrations/${registrationId}/check-out`
				: `${SERVER_PREFIX}/registrations/${registrationId}/check-in`;

		console.log(`Using endpoint: ${endpoint}`);

		return fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	addRegistrationFeedback(registrationId, feedbackData) {
		return fetch(
			`${SERVER_PREFIX}/registrations/${registrationId}/feedback`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify(feedbackData),
			}
		);
	},

	//===============================================
	// COMMON EVENT METHODS (for all users)
	//===============================================

	getAllEvents() {
		return fetch(`${SERVER_PREFIX}/events`);
	},

	// In Api.js, modify the getEvent method
	getEvent(id) {
		// Only use query parameters for cache busting, avoid custom headers
		const timestamp = new Date().getTime();
		const randomValue = Math.random();
		return fetch(
			`${SERVER_PREFIX}/events/${id}?t=${timestamp}&r=${randomValue}`
		);
	},

	getEventReviews(id) {
		return fetch(`${SERVER_PREFIX}/events/${id}/reviews`);
	},

	// Check if user is signed up for an event
	checkEventSignupStatus(eventId) {
		return fetch(`${SERVER_PREFIX}/events/${eventId}/signup/status`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	// Event recommendations
	getRecommendedEvents() {
		return fetch(`${SERVER_PREFIX}/events/recommendations`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	//===============================================
	// ADMIN METHODS
	//===============================================

	// Dashboard stats
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

	// Volunteer verification management
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

	// For volunteer NRIC verification - consolidated duplicate functions
	updateVolunteerVerification(volunteerId, verified, reason) {
		// Get the filename from the UI data if possible
		const requestData = {
			verified,
			reason,
		};

		// Include the filename if it exists in localStorage or from other state
		// This ensures the backend knows which image to verify
		const nricFilename = localStorage.getItem("currentNricFilename");
		if (nricFilename) {
			requestData.filename = nricFilename;
		}

		return fetch(
			`${SERVER_PREFIX}/admin/volunteers/${volunteerId}/verification`,
			{
				method: "PUT",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify(requestData),
			}
		);
	},

	// For organiser account verification
	updateOrganiserVerification(organiserId, status, reason) {
		return fetch(
			`${SERVER_PREFIX}/admin/organisers/${organiserId}/verification`,
			{
				method: "PUT",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({ status, reason }),
			}
		);
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
		// Create a request body object without the resolution_action field
		const requestBody = {
			status,
			admin_notes: adminNotes,
		};

		if (status === "resolved" && resolutionAction) {
			requestBody.resolution_action = resolutionAction;
		}

		return fetch(`${SERVER_PREFIX}/admin/reports/${id}`, {
			method: "PUT",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			body: JSON.stringify(requestBody),
		});
	},

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

	getNRIC(volunteerId = null) {
		let url = `${SERVER_PREFIX}/profile/nric`;

		// Add volunteerId as query param if provided (for admin access)
		if (volunteerId) {
			url += `?/volunteerId=${volunteerId}`;
		}

		// Add cache busting parameter
		url += volunteerId ? `&t=${Date.now()}` : `?t=${Date.now()}`;

		return fetch(url, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	requestPasswordReset(email) {
		return fetch(`${SERVER_PREFIX}/auth/reset-password`, {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify({ email }),
		});
	},

	resetPassword(token, newPassword) {
		return fetch(`${SERVER_PREFIX}/auth/reset-password/${token}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ newPassword }),
		});
	},

	getUserEvents() {
		return fetch(`${SERVER_PREFIX}/profile/events`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	// Add this method to the Api object
	reportVolunteer(volunteerId, eventId, reason, details) {
		return fetch(`${SERVER_PREFIX}/reports`, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			method: "POST",
			body: JSON.stringify({
				reported_type: "Volunteer",
				reported_id: volunteerId,
				event_id: eventId,
				reason,
				details: details || "",
			}),
		});
	},

	generateCertificate(eventId) {
		return fetch(`${SERVER_PREFIX}/certificates/generate/${eventId}`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	getVolunteerCertificates() {
		return fetch(`${SERVER_PREFIX}/certificates/volunteer`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
	},

	verifyCertificate(certificateId) {
		return fetch(`${SERVER_PREFIX}/certificates/verify/${certificateId}`, {
			method: "GET",
		});
	},
};

export default Api;
