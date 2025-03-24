import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { format } from "date-fns"; // Optional for better date formatting
import Navbar from "../layout/Navbar";
import "./EventDetail.css";

// API base URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;

function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_URL}/events/${eventId}`);
        console.log("API Response:", response.data);
        setEvent(response.data);

        // Check if user is logged in, fetch registration status
        if (user) {
          checkRegistrationStatus();
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to load event details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, user]);

  // Check if user is already registered
  const checkRegistrationStatus = async () => {
    try {
      // Get token from Supabase auth (adjust based on your auth implementation)
      const token = await user.getIdToken();

      const response = await axios.get(`${API_URL}/events/user/registered`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check if this event is in the list of registrations
      const isUserRegistered = response.data.some(
        (registration) => registration.event_id === parseInt(eventId)
      );

      setIsRegistered(isUserRegistered);
    } catch (err) {
      console.error("Error checking registration status:", err);
      // Non-critical error, don't show to user
    }
  };

  const handleRegisterClick = () => {
    if (!user) {
      // Redirect to login if not logged in
      navigate("/login", { state: { from: `/event/${eventId}` } });
      return;
    }

    // Check if event is at capacity before showing confirmation modal
    if (
      event.max_volunteers > 0 &&
      (event.registered_count || 0) >= event.max_volunteers
    ) {
      setError(
        "This event has reached maximum capacity. No more slots available."
      );
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const confirmRegistration = async () => {
    try {
      const token = await user.getIdToken();

      await axios.post(
        `${API_URL}/events/${eventId}/register`,
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsRegistered(true);
      setShowConfirmModal(false);
      setRegistrationSuccess(true);

      // Update the event data to reflect the new registration count
      setEvent((prev) => ({
        ...prev,
        registered_count: (prev.registered_count || 0) + 1,
      }));

      // Hide success message after 3 seconds
      setTimeout(() => {
        setRegistrationSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error registering for event:", err);
      setError(err.response?.data?.message || "Failed to register for event");
      setShowConfirmModal(false);
    }
  };

  const cancelRegistration = () => {
    setShowConfirmModal(true);
  };

  const confirmCancellation = async () => {
    try {
      const token = await user.getIdToken();

      await axios.delete(`${API_URL}/events/${eventId}/register`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsRegistered(false);
      setShowConfirmModal(false);

      // Update the event data to reflect the reduced registration count
      setEvent((prev) => ({
        ...prev,
        registered_count: Math.max(0, (prev.registered_count || 1) - 1),
      }));
    } catch (err) {
      console.error("Error cancelling registration:", err);
      setError(err.response?.data?.message || "Failed to cancel registration");
      setShowConfirmModal(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ paddingTop: "80px" }}>
          <div className="text-center my-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ paddingTop: "80px" }}>
          <div className="alert alert-danger my-5">{error}</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ paddingTop: "80px" }}>
          <div className="alert alert-danger my-5">
            Event not found or has been removed.
          </div>
        </div>
      </div>
    );
  }

  // Helper function to format time to display in 12-hour format with AM/PM
  const formatTimeToDisplay = (timeString) => {
    if (!timeString) return "";

    // If time is already in HH:MM format, convert to 12-hour format with AM/PM
    const [hours, minutes] = timeString.split(":").map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
      return timeString; // Return as is if parsing fails
    }

    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM

    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Format date strings
  const formatDateRange = () => {
    // Handle recurring events display
    if (
      event.is_recurring &&
      event.recurrence_pattern &&
      event.start_time &&
      event.end_time
    ) {
      // Get day name based on recurrence_day (0-6 where 0 is Sunday)
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName =
        event.recurrence_day !== null &&
        event.recurrence_day >= 0 &&
        event.recurrence_day <= 6
          ? dayNames[event.recurrence_day]
          : "";

      // Format time (already in HH:MM format)
      const startTime = formatTimeToDisplay(event.start_time);
      const endTime = formatTimeToDisplay(event.end_time);

      // Start date and end date
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);

      // Format the recurring pattern first line (e.g., "Every Wed 7:30 PM - 9:00 PM")
      let recurrenceText = `Every ${dayName} ${startTime} - ${endTime}`;

      // Format the date range second line
      let dateRangeText = "";
      try {
        if (typeof format === "function") {
          // Using date-fns
          const startDateFormatted = format(startDate, "EEE, MMM dd, yyyy");
          const endDateFormatted = format(endDate, "EEE, MMM dd, yyyy");
          dateRangeText = `${startDateFormatted} - ${endDateFormatted}`;
        } else {
          // Native JS date formatting
          const dateOptions = {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "2-digit",
          };
          dateRangeText = `${startDate.toLocaleDateString(
            undefined,
            dateOptions
          )} - ${endDate.toLocaleDateString(undefined, dateOptions)}`;
        }
      } catch (err) {
        console.error("Error formatting recurring date range:", err);
        dateRangeText = `${event.start_date} - ${event.end_date}`;
      }

      return `${recurrenceText}\n${dateRangeText}`;
    }

    // Handle non-recurring events with time
    if (
      event.time &&
      typeof event.time === "string" &&
      event.time.trim() !== ""
    ) {
      let dateText = "";

      // Format the date part
      if (event.start_date && event.end_date) {
        try {
          const startDate = new Date(event.start_date);
          const endDate = new Date(event.end_date);

          if (typeof format === "function") {
            // Using date-fns
            dateText = `${format(startDate, "EEE, MMM dd, yyyy")}`;

            // Only add end date if it's different from start date
            if (
              format(startDate, "yyyy-MM-dd") !== format(endDate, "yyyy-MM-dd")
            ) {
              dateText += ` - ${format(endDate, "EEE, MMM dd, yyyy")}`;
            }
          } else {
            // Native JS date formatting
            const dateOptions = {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "2-digit",
            };
            dateText = startDate.toLocaleDateString(undefined, dateOptions);

            // Only add end date if it's different
            if (startDate.toDateString() !== endDate.toDateString()) {
              dateText += ` - ${endDate.toLocaleDateString(
                undefined,
                dateOptions
              )}`;
            }
          }
        } catch (err) {
          console.error("Error formatting date:", err);
          dateText = `${event.start_date}`;
          if (event.start_date !== event.end_date) {
            dateText += ` - ${event.end_date}`;
          }
        }
      }

      return `${dateText}\n${event.time.trim()}`;
    }

    // Fall back to just date range if no recurring pattern or specific time
    if (event.start_date && event.end_date) {
      try {
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);

        if (typeof format === "function") {
          // Using date-fns
          return `${format(startDate, "EEE, MMM dd, yyyy")} - ${format(
            endDate,
            "EEE, MMM dd, yyyy"
          )}`;
        } else {
          // Native JS date formatting
          const dateOptions = {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "2-digit",
          };
          return `${startDate.toLocaleDateString(
            undefined,
            dateOptions
          )} - ${endDate.toLocaleDateString(undefined, dateOptions)}`;
        }
      } catch (err) {
        console.error("Error formatting date range:", err);
        return `${event.start_date} - ${event.end_date}`;
      }
    }

    // If we have a duration but no date/time information
    if (event.duration !== undefined && event.duration !== null) {
      // Convert duration to number if it's a string of digits
      const durationValue =
        typeof event.duration === "string" && /^\d+$/.test(event.duration)
          ? parseInt(event.duration, 10)
          : event.duration;

      // Handle numeric duration
      if (typeof durationValue === "number") {
        if (durationValue >= 60) {
          const hours = Math.floor(durationValue / 60);
          const minutes = durationValue % 60;
          return minutes > 0
            ? `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${
                minutes > 1 ? "s" : ""
              }`
            : `${hours} hour${hours > 1 ? "s" : ""}`;
        }
        return `${durationValue} minute${durationValue !== 1 ? "s" : ""}`;
      }

      // If duration is just a string, return it directly
      return event.duration;
    }

    return "Date and time information unavailable";
  };

  // Process data for display
  const formattedEvent = {
    title: event.name,
    organizer: event.organizer_name || "Organization",
    date: formatDateRange(),
    specificDates: event.specific_dates
      ? event.specific_dates.split(",").map((date) => date.trim())
      : [],
    location: event.location,
    category: event.cause,
    tags: event.tags
      ? event.tags.split(",").map((tag) => tag.trim())
      : [event.cause],
    remainingSlots: event.max_volunteers
      ? event.max_volunteers - (event.registered_count || 0)
      : null,
    totalSlots: event.max_volunteers || 0,
    description: event.description,
    requirements: event.requirements
      ? event.requirements.split(",").map((req) => req.trim())
      : [],
    responsibilities: event.responsibilities
      ? event.responsibilities.split(",").map((resp) => resp.trim())
      : [],
    contactPerson: event.contact_person || "Contact person",
    contactEmail: event.contact_email || "contact@email.com",
    imageUrl: event.image_url || "/src/assets/event-placeholder.jpg",
    status: event.status || "active",
    hasLimitedSlots: event.max_volunteers && event.max_volunteers > 0,
    isRecurring: event.is_recurring || false,
  };

  return (
    <div>
      <Navbar />

      <div className="event-detail-container">
        {/* Breadcrumb navigation */}
        <div className="breadcrumb-container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="/">Home</a>
              </li>
              <li className="breadcrumb-item">
                <a href="/volunteer">Volunteer</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {formattedEvent.title}
              </li>
            </ol>
          </nav>
        </div>

        {/* Event header */}
        <div className="event-header">
          <h1>{formattedEvent.title}</h1>
          <div className="organizer-badge">
            <img
              src="/src/assets/org-logo.svg"
              alt="Organization logo"
              className="org-logo"
            />
            <span>{formattedEvent.organizer}</span>
          </div>

          <div className="share-btn">
            <button className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-share"></i> Share
            </button>
          </div>
        </div>

        <div className="event-content">
          {/* Registration success message */}
          {registrationSuccess && (
            <div
              className="alert alert-success alert-dismissible fade show"
              role="alert"
            >
              You have successfully registered for this event!
              <button
                type="button"
                className="btn-close"
                onClick={() => setRegistrationSuccess(false)}
              ></button>
            </div>
          )}

          {/* Main content grid */}
          <div className="event-grid">
            <div className="event-main">
              {/* Image carousel */}
              <div className="event-image-container">
                <img
                  src={formattedEvent.imageUrl}
                  alt={formattedEvent.title}
                  className="event-image"
                />
              </div>

              {/* Cause tags */}
              <div className="event-causes">
                <h5>Supported causes</h5>
                <div className="causes-tags">
                  {formattedEvent.tags.map((tag, index) => (
                    <span key={index} className="cause-tag">
                      {tag.includes("Community") && (
                        <i className="bi bi-people-fill"></i>
                      )}
                      {tag.includes("Education") && (
                        <i className="bi bi-book-fill"></i>
                      )}
                      {tag.includes("Social") && (
                        <i className="bi bi-heart-fill"></i>
                      )}
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* About the opportunity */}
              <div className="event-section">
                <h3>About the opportunity</h3>
                <p>{formattedEvent.description}</p>

                <div className="event-details">
                  <div className="detail-item">
                    <h5>Day and time of sessions</h5>
                    <div className="date-time-details">
                      <div>
                        <strong className="d-block mb-1">Date:</strong>
                        <span>{formattedEvent.date.split("\n")[0]}</span>
                      </div>
                      {event.start_time && event.end_time && (
                        <div>
                          <strong className="d-block mb-1">Time:</strong>
                          <span>
                            {formatTimeToDisplay(event.start_time)} -{" "}
                            {formatTimeToDisplay(event.end_time)}
                          </span>
                        </div>
                      )}
                    </div>
                    {formattedEvent.specificDates.length > 0 && (
                      <div className="mt-3">
                        <strong className="d-block mb-1">
                          Specific Dates:
                        </strong>
                        <ul className="specific-dates">
                          {formattedEvent.specificDates.map((date, index) => (
                            <li key={index}>{date}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="detail-item">
                    <h5>Location</h5>
                    <p>{formattedEvent.location}</p>
                  </div>

                  {formattedEvent.requirements.length > 0 && (
                    <div className="detail-item">
                      <h5>Basic requirements</h5>
                      <ul>
                        {formattedEvent.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="detail-item">
                    <h5>For more information/questions, please contact:</h5>
                    <p>
                      {formattedEvent.contactPerson}
                      <br />
                      {formattedEvent.contactEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Volunteer positions */}
              <div className="event-section">
                <h3>Volunteer positions</h3>
                <div className="position-card">
                  <div className="position-header">
                    <h4>Volunteer</h4>
                    <span className="slots-remaining">
                      {formattedEvent.hasLimitedSlots
                        ? `${formattedEvent.remainingSlots} of ${formattedEvent.totalSlots} slots left`
                        : "Open registration (no slot limit)"}
                    </span>
                  </div>
                  <div className="position-body">
                    <p>
                      {formattedEvent.responsibilities[0] ||
                        "Help support this event as a volunteer"}
                    </p>
                  </div>
                </div>
              </div>

              {/* About the organization */}
              <div className="event-section">
                <h3>About the organisation</h3>
                <p>
                  {event.org_description ||
                    "Founded in June 2017, Happy Children Happy Future (HCHF) is a initiative committed to transforming the lives of Primary 1 to Secondary 3 students from low-income or single-parent families. Through free tuition, we strive to close the education gap and open doors to brighter opportunities for these deserving children."}
                </p>

                <h4>Why Your Support Matters</h4>
                <p>
                  Every child has the potential to thrive, but many face
                  challenges that stand in their way—limited resources,
                  restricted opportunities, and circumstances beyond their
                  control. These struggles not only impact their academics but
                  also their confidence and future possibilities.
                </p>

                <p>
                  At HCHF, we aim to change that story. With your help, we can
                  bridge the educational gap, uplift young minds, and give these
                  children the tools to overcome their hurdles.
                </p>

                <h4>Join the Movement—Be Part of the Change</h4>
                <p>
                  As a volunteer, you're not just teaching; you're inspiring
                  confidence, shaping futures, and building a better society for
                  us all. Your time could be the catalyst that turns struggles
                  into triumphs and dreams into realities.
                </p>

                <p className="highlight-quote">
                  ✨ Volunteer with HCHF today—because every child deserves the
                  chance to shine. ✨
                </p>
              </div>
            </div>

            {/* Sidebar with registration */}
            <div className="event-sidebar">
              <div className="registration-card">
                <div className="info-item">
                  <div className="icon">📍</div>
                  <div className="content">
                    <h5>Location</h5>
                    <p>{formattedEvent.location}</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="icon">🗓️</div>
                  <div className="content">
                    <h5>Date and time</h5>
                    {formattedEvent.date.includes("\n") ? (
                      formattedEvent.date.split("\n").map((line, i) => (
                        <p
                          key={i}
                          className={i === 0 ? "mb-1 font-weight-bold" : "mb-0"}
                        >
                          {i === 0 && !event.is_recurring && (
                            <strong>Time: </strong>
                          )}
                          {i === 1 && !event.is_recurring && (
                            <strong>Date: </strong>
                          )}
                          {line}
                        </p>
                      ))
                    ) : (
                      <>
                        <p>
                          <strong>Date: </strong>
                          {formattedEvent.date}
                        </p>
                        {event.start_time && event.end_time && (
                          <p>
                            <strong>Time: </strong>
                            {formatTimeToDisplay(event.start_time)} -{" "}
                            {formatTimeToDisplay(event.end_time)}
                          </p>
                        )}
                      </>
                    )}

                    {formattedEvent.specificDates.length > 0 && (
                      <ul className="specific-dates mt-2">
                        <strong>Specific Dates:</strong>
                        {formattedEvent.specificDates.map((date, index) => (
                          <li key={index}>{date}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {isRegistered ? (
                  <button
                    className="btn btn-outline-danger btn-lg w-100"
                    onClick={cancelRegistration}
                  >
                    Cancel Registration
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-lg w-100"
                    onClick={handleRegisterClick}
                    disabled={
                      formattedEvent.status !== "active" ||
                      (formattedEvent.hasLimitedSlots &&
                        formattedEvent.remainingSlots <= 0)
                    }
                  >
                    {formattedEvent.status !== "active"
                      ? "Event Not Active"
                      : formattedEvent.hasLimitedSlots &&
                        formattedEvent.remainingSlots <= 0
                      ? "No Spots Available"
                      : "I want to volunteer"}
                  </button>
                )}

                <div className="slots-info">
                  {formattedEvent.hasLimitedSlots ? (
                    <>
                      <p>
                        <strong>{formattedEvent.remainingSlots}</strong> of{" "}
                        <strong>{formattedEvent.totalSlots}</strong> spots left
                      </p>
                      <div className="progress">
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{
                            width: `${
                              ((formattedEvent.totalSlots -
                                formattedEvent.remainingSlots) /
                                formattedEvent.totalSlots) *
                              100
                            }%`,
                          }}
                          aria-valuenow={
                            formattedEvent.totalSlots -
                            formattedEvent.remainingSlots
                          }
                          aria-valuemin="0"
                          aria-valuemax={formattedEvent.totalSlots}
                        ></div>
                      </div>
                    </>
                  ) : (
                    <p>Open registration (no slot limit)</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>
                {isRegistered ? "Cancel Registration" : "Confirm Registration"}
              </h3>
              <button
                className="close-btn"
                onClick={() => setShowConfirmModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {isRegistered ? (
                <p>
                  Are you sure you want to cancel your registration for this
                  event? This action cannot be undone.
                </p>
              ) : (
                <>
                  <p>You are about to register as a volunteer for:</p>
                  <p>
                    <strong>{formattedEvent.title}</strong>
                  </p>
                  <p>Please ensure you can commit to the following:</p>
                  <ul>
                    {formattedEvent.requirements.length > 0 ? (
                      formattedEvent.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))
                    ) : (
                      <li>Attending at the specified date and time</li>
                    )}
                  </ul>
                  {formattedEvent.isRecurring && (
                    <p className="recurring-notice">
                      <strong>Note:</strong> This is a recurring event. By
                      registering, you are committing to attend all sessions
                      within the specified date range.
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              {isRegistered ? (
                <button
                  className="btn btn-danger"
                  onClick={confirmCancellation}
                >
                  Confirm Cancellation
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={confirmRegistration}
                >
                  Confirm Registration
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventDetail;
