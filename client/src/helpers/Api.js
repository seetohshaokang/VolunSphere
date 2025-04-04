// src/helpers/Api.js
// Base API helper for making requests to the backend

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:8000/api";

class Api {
	// Authentication methods
	static async loginUser(credentials) {
		return fetch(`${API_BASE_URL}/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(credentials),
		});
	}

	static async registerUser(userData) {
		return fetch(`${API_BASE_URL}/auth/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(userData),
		});
	}

	// User profile methods
	static async getUserProfile() {
		const token = localStorage.getItem("token");
		return fetch(`${API_BASE_URL}/profile`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		});
	}

	static async updateUserProfile(formData) {
		const token = localStorage.getItem("token");
		return fetch(`${API_BASE_URL}/profile`, {
			method: "PUT",
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: formData,
		});
	}

	// Event methods
	static async getAllEvents() {
		return fetch(`${API_BASE_URL}/events`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	static async getEvent(id) {
		return fetch(`${API_BASE_URL}/events/${id}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	static async createEvent(eventData) {
		const token = localStorage.getItem("token");
		return fetch(`${API_BASE_URL}/events`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(eventData),
		});
	}

	static async updateEvent(id, eventData) {
		const token = localStorage.getItem("token");
		return fetch(`${API_BASE_URL}/events/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(eventData),
		});
	}

	static async deleteEvent(id) {
		const token = localStorage.getItem("token");
		return fetch(`${API_BASE_URL}/events/${id}`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
	}

	// Registration methods
	static async registerForEvent(eventId) {
		const token = localStorage.getItem("token");
		return fetch(`${API_BASE_URL}/events/${eventId}/registrations`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		});
	}

	static async cancelEventRegistration(eventId) {
		const token = localStorage.getItem("token");
		return fetch(`${API_BASE_URL}/events/${eventId}/registrations`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
	}

	static async getRegisteredEvents() {
		const token = localStorage.getItem("token");
		return fetch(`${API_BASE_URL}/registrations`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		});
	}

	static async getOrganizedEvents() {
		const token = localStorage.getItem("token");
		return fetch(`${API_BASE_URL}/profile/events`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		});
	}
}

export default Api;
