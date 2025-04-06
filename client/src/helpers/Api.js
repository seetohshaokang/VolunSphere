const SERVER_PREFIX =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const Api = {
  baseUrl: SERVER_PREFIX,

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

  // Updated to handle image uploads
  createEvent(data, imageFile) {
    const token = localStorage.getItem("token");

    // Create a copy of the data to modify
    const eventData = { ...data };

    // Handle recurring event data formatting
    if (eventData.is_recurring) {
      // Format recurrence_time from separate fields if they exist
      if (eventData.recurrence_time_start && eventData.recurrence_time_end) {
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
          (typeof eventData[key] === "object" && eventData[key] !== null)
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

  // Updated to handle image uploads
  updateEvent(id, data, imageFile) {
    const token = localStorage.getItem("token");

    // Create a copy of the data to modify
    const eventData = { ...data };

    // Handle recurring event data formatting
    if (eventData.is_recurring) {
      // Format recurrence_time from separate fields if they exist
      if (eventData.recurrence_time_start && eventData.recurrence_time_end) {
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
          (typeof eventData[key] === "object" && eventData[key] !== null)
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
  // Update this method in your Api.js file

  getEventVolunteers: function (eventId) {
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
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const data = await response.json();
              console.log("Successfully parsed JSON response:", data);
              return data;
            } else {
              console.warn("Response not JSON, content type:", contentType);
              // Try to parse anyway in case Content-Type is misconfigured
              try {
                const data = await response.json();
                console.log(
                  "Successfully parsed JSON despite content type:",
                  data
                );
                return data;
              } catch (parseError) {
                console.error("Failed to parse response as JSON:", parseError);
                const text = await response.text();
                console.log("Response text:", text.substring(0, 200) + "...");
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
};

export default Api;
