import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  AlertTriangle, 
  ShieldAlert, 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  RepeatIcon,
  ClockIcon,
  User
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import Api from "../../../helpers/Api";
import { getEventImageUrl } from "../../../helpers/eventHelper";

// Map of numeric day values to weekday names
const DAYS_OF_WEEK = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [wasRemoved, setWasRemoved] = useState(false);
  const [removalReason, setRemovalReason] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(false);

  // Update timestamp after fetching event details
  useEffect(() => {
    if (event) {
      setImageTimestamp(Date.now());
    }
  }, [event]);

  // Reset the signup status when user changes or logs out
  useEffect(() => {
    fetchEventDetails();
    // Only fetch details when eventId changes, not when user changes
    // User changes are handled in a separate effect
  }, [eventId]);

  // Separate useEffect for handling authentication changes
  useEffect(() => {
    // If user is null (logged out), always reset signup status
    if (!user) {
      setIsSignedUp(false);
      setWasRemoved(false);
    } else if (event) {
      // Only check signup status if user is logged in and event is loaded
      checkSignupStatus();
    }
  }, [user, event]);

  // Update the useEffect dependencies to properly trigger signup status check
  useEffect(() => {
    // Only check signup status if user is logged in and event is loaded
    if (user && event) {
      console.log("Checking signup status for user:", user.id, "event:", eventId);
      checkSignupStatus();
    }
  }, [user, event, eventId]); // Include eventId in the dependency array

  // Fetch event details with better error handling and signup status check
  const fetchEventDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching event details for event:", eventId);

      // Using the Api helper to fetch event
      const response = await Api.getEvent(eventId);

      if (!response.ok) {
        // Handle non-200 responses
        if (response.status === 404) {
          throw new Error("Event not found");
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to load event details");
        }
      }

      const eventData = await response.json();
      console.log("Event data fetched successfully:", eventData.name);
      setEvent(eventData);

      // After event is loaded and if user is logged in, check signup status
      if (user) {
        await checkSignupStatus();
      }
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError(
        err.message || "Failed to load event details. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Enhance checkSignupStatus to better handle the response
  const checkSignupStatus = async () => {
    // Do nothing if user is not logged in or no event
    if (!user || !event) {
      setIsSignedUp(false);
      setWasRemoved(false);
      return;
    }

    try {
      console.log("Fetching signup status for event:", eventId);
      const response = await Api.checkEventSignupStatus(eventId);
      console.log("Signup status response:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Signup status data:", data);

        // Update state based on response
        setIsSignedUp(!!data.isSignedUp);
        setWasRemoved(!!data.wasRemoved);
        setRemovalReason(data.removalReason || "");

        console.log("Updated isSignedUp state to:", !!data.isSignedUp);
      } else {
        console.error("Error response from signup status check:", response.status);
        // If there's an error, assume not signed up
        setIsSignedUp(false);
        setWasRemoved(false);
      }
    } catch (err) {
      console.error("Error checking signup status:", err);
      // Non-critical error, assume not signed up
      setIsSignedUp(false);
      setWasRemoved(false);
    }
  };

  // Add this function to check if the volunteer is verified
  const checkVerificationStatus = async () => {
    try {
      const response = await Api.getUserProfile();
      if (response.ok) {
        const data = await response.json();
        // For volunteers, we need to check the nric_image.verified property
        if (data.profile && data.profile.nric_image && data.profile.nric_image.verified) {
          return true; // Volunteer is verified
        } else {
          return false; // Volunteer is not verified
        }
      }
      return false; // Default to not verified if API call fails
    } catch (err) {
      console.error("Error checking verification status:", err);
      return false; // Default to not verified on error
    }
  };

  // Update handleSignupClick to check verification status first
  const handleSignupClick = async () => {
    if (!user) {
      // Redirect to login if not logged in
      navigate("/login", { state: { from: `/events/${eventId}` } });
      return;
    }

    // Don't allow signup if previously removed
    if (wasRemoved) {
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

    // Check verification status before proceeding
    const isVerified = await checkVerificationStatus();
    if (!isVerified) {
      // Show verification modal instead of confirmation modal
      setShowVerificationModal(true);
      return;
    }

    // If volunteer is verified, show confirmation modal
    setShowConfirmModal(true);
  };

  const getAvailableSlots = (event) => {
    if (!event || !event.max_volunteers) return 0;
    return Math.max(0, event.max_volunteers - (event.registered_count || 0));
  };

  // Add handler for the verification modal's "Go to Profile" button
  const handleGoToProfile = () => {
    setShowVerificationModal(false);
    navigate("/profile");
  };

  // Update the confirmSignup function to handle verification error
  const confirmSignup = async () => {
    setIsLoading(true);

    try {
      console.log("Attempting to sign up for event:", eventId);
      const response = await Api.registerForEvent(eventId);

      const data = await response.json();
      console.log("Signup response:", data);

      if (response.ok) {
        setSuccessMessage("You have successfully signed up for this event.");

        // Update state to reflect signup
        setIsSignedUp(true);

        // Refresh event details to get updated volunteer count
        fetchEventDetails();

        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        // Handle specific error cases
        if (data.message && data.message.includes("already signed up")) {
          setSuccessMessage("You are already signed up for this event.");
          // Update the state to reflect the user is already signed up
          setIsSignedUp(true);
        } else if (data.message && data.message.includes("recurring event")) {
          setError(data.message || "Cannot sign up for recurring event");
        } else if (data.requiresVerification) {
          // Show the verification modal instead of a simple error message
          setShowVerificationModal(true);
        } else {
          setError(data.message || "Failed to sign up for the event. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error signing up for event:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
      // Re-check signup status to ensure UI is consistent
      checkSignupStatus();
    }
  };

  // Add this function to determine if an event is completed
  const isEventCompleted = () => {
    if (!event) return false;

    // Find the first valid date from all possible date fields
    const dateField = event.end_datetime || event.end_date || event.start_datetime || event.start_date;

    if (!dateField) return false;

    const eventDate = new Date(dateField);
    if (isNaN(eventDate.getTime())) {
      return false;
    }

    const now = new Date();
    return eventDate < now;
  };

  // Helper function to format date strings - improved to handle more date formats
  const formatDateRange = () => {
    // For events with standard start and end dates
    if (event.start_date && event.end_date) {
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);

      const options = {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      };

      if (startDate.toDateString() === endDate.toDateString()) {
        return startDate.toLocaleDateString(undefined, options);
      } else {
        return `${startDate.toLocaleDateString(
          undefined,
          options
        )} - ${endDate.toLocaleDateString(undefined, options)}`;
      }
    }

    // For events with datetime fields (includes time)
    if (event.start_datetime) {
      const startDateTime = new Date(event.start_datetime);

      const dateOptions = {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      };

      const timeOptions = {
        hour: '2-digit',
        minute: '2-digit'
      };

      const dateStr = startDateTime.toLocaleDateString(undefined, dateOptions);
      const timeStr = startDateTime.toLocaleTimeString(undefined, timeOptions);

      if (event.end_datetime) {
        const endDateTime = new Date(event.end_datetime);

        if (startDateTime.toDateString() === endDateTime.toDateString()) {
          // Same day, show date once with time range
          const endTimeStr = endDateTime.toLocaleTimeString(undefined, timeOptions);
          return `${dateStr}, ${timeStr} - ${endTimeStr}`;
        } else {
          // Different days, show complete range
          const endDateStr = endDateTime.toLocaleDateString(undefined, dateOptions);
          const endTimeStr = endDateTime.toLocaleTimeString(undefined, timeOptions);
          return `${dateStr}, ${timeStr} - ${endDateStr}, ${endTimeStr}`;
        }
      }

      return `${dateStr}, ${timeStr}`;
    }

    // For recurring events
    if (event.is_recurring) {
      if (event.recurrence_start_date && event.recurrence_end_date) {
        const startDate = new Date(event.recurrence_start_date);
        const endDate = new Date(event.recurrence_end_date);

        const options = {
          month: "numeric",
          day: "numeric",
          year: "numeric",
        };

        return `${startDate.toLocaleDateString(undefined, options)} - ${endDate.toLocaleDateString(undefined, options)}`;
      }

      if (event.recurrence_start_date) {
        const startDate = new Date(event.recurrence_start_date);
        const options = {
          month: "numeric",
          day: "numeric",
          year: "numeric",
        };
        return startDate.toLocaleDateString(undefined, options);
      }
    }

    return "Date information unavailable";
  };

  // Add the cancelRegistration function back with the completed event check
  const cancelRegistration = async () => {
    // Don't allow cancellation for completed events
    if (isEventCompleted()) {
      setShowConfirmModal(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Attempting to cancel registration for event:", eventId);

      // Make sure we're using the cancelEventRegistration function
      const response = await Api.cancelEventRegistration(eventId);

      // Add debugging for API response
      console.log("Cancel registration response status:", response.status);

      // For non-JSON responses
      if (!response.ok && response.status !== 404) {
        let errorMessage;
        try {
          // Try to parse as JSON
          const errorData = await response.json();
          errorMessage = errorData.message || "Failed to cancel registration";
          console.error("Error response data:", errorData);
        } catch (e) {
          // If not JSON, use status text
          errorMessage = response.statusText || "Failed to cancel registration";
          console.error("Non-JSON error response:", response.statusText);
        }

        setError(errorMessage);
        setIsLoading(false);
        setShowConfirmModal(false);
        return;
      }

      let data;
      try {
        data = await response.json();
        console.log("Cancellation response data:", data);
      } catch (e) {
        console.log("No JSON in response or empty response");
        data = {};
      }

      if (response.ok) {
        setSuccessMessage("You have successfully cancelled your registration for this event.");

        // Update state to reflect cancellation
        setIsSignedUp(false);

        // Refresh event details to get updated volunteer count
        await fetchEventDetails();

        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError(data.message || "Failed to cancel registration. Please try again.");
      }
    } catch (error) {
      console.error("Error cancelling registration:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
      // Re-check signup status to ensure UI is consistent
      await checkSignupStatus();
    }
  };

  // Format recurring days for display
  const formatRecurringDays = (days) => {
    if (!days || days.length === 0) return "No days specified";

    return days.map((day) => DAYS_OF_WEEK[day]).join(", ");
  };

  // Format time for display
  const formatTime = (time) => {
    if (!time) return "";

    // If time is in 24-hour format (HH:MM), convert to 12-hour format
    if (time.match(/^\d{1,2}:\d{2}$/)) {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    }

    return time;
  };

  // Calculate filled spots
  const calculateFilledSpots = () => {
    if (!event || !event.max_volunteers) return 0;
    return Math.max(0, event.registered_count || 0);
  };

  const isEventFull = event && event.max_volunteers > 0 && event.registered_count >= event.max_volunteers;

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="ml-3 text-lg">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={() => navigate("/events")}>
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  // No event found state
  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive" className="my-6">
          <AlertDescription>
            Event not found or has been removed.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={() => navigate("/events")}>
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Event header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            {event.name}
          </h1>
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
            <span className="text-gray-600">
              {event.organiser_name || "Organization"}
            </span>
          </div>

          <div className="mt-2 flex gap-2">
            <Badge
              className={
                event.status === "active"
                  ? "bg-green-100 text-green-800"
                  : event.status === "draft"
                  ? "bg-yellow-100 text-yellow-800"
                  : event.status === "completed"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {(event.status || "ACTIVE").toUpperCase()}
            </Badge>

            {event.is_recurring && (
              <Badge className="bg-blue-100 text-blue-800">RECURRING</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Registration success message */}
      {successMessage && (
        <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
          <AlertDescription>
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-6 shadow-sm">
            <CardContent className="p-6">
              {/* Banner image */}
              <div className="mb-6">
                <img
                  src={
                    event.image_url
                      ? getEventImageUrl(event.image_url, imageTimestamp)
                      : "/src/assets/default-event.jpg"
                  }
                  alt={event.name}
                  className="w-full h-64 object-cover rounded-md shadow-sm"
                />
              </div>

              {/* Categories/Causes */}
              {event.causes && event.causes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.causes.map((cause, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {cause}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <div className="text-gray-700 whitespace-pre-line">{event.description}</div>
              </div>

              {/* Event timing details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Event Schedule</h3>

                {event.is_recurring ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <RepeatIcon className="h-5 w-5 text-primary" />
                      <span className="font-medium">Recurring Event:</span>
                      <span className="capitalize">
                        {event.recurrence_pattern || "Weekly"}
                      </span>
                    </div>

                    {event.recurrence_days && event.recurrence_days.length > 0 && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        <span className="font-medium">Recurring Days:</span>
                        <span>
                          {formatRecurringDays(event.recurrence_days)}
                        </span>
                      </div>
                    )}

                    {event.recurrence_time && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <ClockIcon className="h-5 w-5 text-primary" />
                        <span className="font-medium">Event Time:</span>
                        <span>
                          {formatTime(event.recurrence_time.start)} -{" "}
                          {formatTime(event.recurrence_time.end)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      <span className="font-medium">Date:</span>
                      <span>{formatDateRange()}</span>
                    </div>

                    {event.start_time && event.end_time && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <ClockIcon className="h-5 w-5 text-primary" />
                        <span className="font-medium">Time:</span>
                        <span>
                          {event.start_time} - {event.end_time}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  Contact Information
                </h3>
                <p className="text-gray-700">
                  {event.contact_person && (
                    <>
                      <span className="font-medium">Contact Person:</span>{" "}
                      {event.contact_person}
                      <br />
                    </>
                  )}
                  {event.contact_email && (
                    <>
                      <span className="font-medium">Email:</span>{" "}
                      {event.contact_email}
                    </>
                  )}
                </p>
              </div>

              {/* Requirements Section - if available */}
              {event.requirements && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {event.requirements
                      .split(",")
                      .map((req, index) => (
                        <li key={index} className="text-gray-700">{req.trim()}</li>
                      ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with registration */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-5">
              <div className="flex mb-5">
                <div className="text-2xl mr-3">📍</div>
                <div>
                  <h5 className="font-semibold text-gray-700 mb-1">Location</h5>
                  <p className="text-gray-800">{event.location}</p>
                </div>
              </div>

              <div className="flex mb-6">
                <div className="text-2xl mr-3">🗓️</div>
                <div>
                  <h5 className="font-semibold text-gray-700 mb-1">
                    Date and time
                  </h5>
                  <p className="text-gray-800">{formatDateRange()}</p>
                  {event.start_time && event.end_time && (
                    <p className="text-gray-800">
                      <strong>Time: </strong>
                      {event.start_time} - {event.end_time}
                    </p>
                  )}
                </div>
              </div>

              {/* Conditional rendering based on signup status */}
              {wasRemoved ? (
                <div className="mb-4 bg-red-50 p-4 rounded-md">
                  <div className="flex items-start mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                    <p className="text-red-700 font-medium">
                      You were removed from this event
                    </p>
                  </div>
                  {removalReason && (
                    <p className="text-red-600 text-sm ml-7">{removalReason}</p>
                  )}
                  <p className="text-gray-600 text-sm mt-2 ml-7">
                    You cannot sign up for this event again.
                  </p>
                </div>
              ) : isSignedUp ? (
                <>
                  <div className="mb-4 bg-green-50 p-4 rounded-md">
                    <p className="text-green-700 font-medium">
                      You are signed up for this event
                    </p>
                  </div>
                  {isEventCompleted() ? (
                    <div className="mb-4 bg-gray-50 p-4 rounded-md">
                      <p className="text-gray-700">
                        This event has been completed. You cannot cancel your registration.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-md text-base font-medium transition-colors"
                    >
                      Cancel Signup
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={handleSignupClick}
                  disabled={!event.status || event.status !== "active" || isEventFull || wasRemoved}
                  className={`w-full py-3 px-4 rounded-md text-base font-medium transition-colors ${!event.status || event.status !== "active" || isEventFull || wasRemoved
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                >
                  {!event.status || event.status !== "active"
                    ? "Event Not Active"
                    : isEventFull
                      ? "No Spots Available"
                      : "I want to volunteer"}
                </button>
              )}

              {event.max_volunteers > 0 && (
                <div className="mt-5 text-center text-gray-600">
                  <p className="mb-2">
                    <strong>{getAvailableSlots(event)}</strong> of{" "}
                    <strong>{event.max_volunteers}</strong> spots left
                  </p>
                  <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{
                        width: `${((event.registered_count || 0) / event.max_volunteers) *
                          100
                          }%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmModal}
        onOpenChange={(open) => {
          // When dialog is closed, check signup status again
          if (!open) {
            setShowConfirmModal(false);
            checkSignupStatus(); // Re-check signup status when dialog closes
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>
              {isSignedUp ? "Cancel Signup" : "Confirm Signup"}
            </DialogTitle>
            <DialogDescription>
              {isSignedUp ? (
                <p>
                  Are you sure you want to cancel your signup for this event?
                  This action cannot be undone.
                </p>
              ) : (
                <>
                  <p className="mb-2">
                    You are about to sign up as a volunteer for:
                  </p>
                  <p className="font-semibold mb-2">{event.name}</p>
                  <p className="mb-2">
                    Please ensure you can commit to the following:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mb-4">
                    {event.requirements ? (
                      event.requirements
                        .split(",")
                        .map((req, index) => <li key={index}>{req.trim()}</li>)
                    ) : (
                      <li>Attending at the specified date and time</li>
                    )}
                  </ul>
                  {event.is_recurring && (
                    <p className="font-medium text-yellow-600 mt-2 mb-2">
                      <strong>Important:</strong> This is a recurring event. You can only sign up for one instance of a recurring event. If you sign up for this event, you won't be able to sign up for other instances.
                    </p>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant={isSignedUp ? "destructive" : "default"}
              onClick={isSignedUp ? cancelRegistration : confirmSignup}
              className={isSignedUp ? "" : "border-2 border-black"}
            >
              {isSignedUp ? "Confirm Cancellation" : "Confirm Signup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verification Required Modal */}
      <Dialog
        open={showVerificationModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowVerificationModal(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <div className="flex items-center mb-2">
              <ShieldAlert className="h-6 w-6 text-yellow-500 mr-2" />
              <DialogTitle>Verification Required</DialogTitle>
            </div>
            <DialogDescription>
              <p className="mb-4">
                You are currently not verified. Before registering for events, please upload the relevant certification documents to complete the verification process.
              </p>
              <p className="text-sm text-gray-600">
                Verification helps establish trust with volunteers and ensures all organizers meet our community standards.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="destructive"
              onClick={() => setShowVerificationModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGoToProfile}
            >
              Go to Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EventDetail;
