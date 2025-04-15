// src/containers/EventDetail/index.jsx - Modified sections
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Share } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import Api from "../../../helpers/Api";
import ReviewSection from "../../../components/ReviewSection";
import { getEventImageUrl } from "../../../helpers/eventHelper";

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
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());

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

  // Fetch event details
  const fetchEventDetails = async () => {
    setLoading(true);
    setError(null);

    try {
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
      setEvent(eventData);

      // We don't check signup status here anymore since it's handled in a separate useEffect
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError(
        err.message || "Failed to load event details. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [eventId, user]);

  // Fetch event reviews
  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true);

      try {
        const response = await Api.getEventReviews(eventId);
        const reviewsData = await response.json();
        setReviews(reviewsData);
      } catch (err) {
        console.error("Error fetching event reviews:", err);
        // Not showing error for reviews as it's not critical
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (eventId) {
      fetchReviews();
    }
  }, [eventId]);

  // Check if user is already signed up or has been removed
  const checkSignupStatus = async () => {
    // Do nothing if user is not logged in
    if (!user) {
      setIsSignedUp(false);
      setWasRemoved(false);
      return;
    }

    try {
      const response = await Api.checkEventSignupStatus(eventId);

      if (response.ok) {
        const data = await response.json();
        setIsSignedUp(data.isSignedUp);
        setWasRemoved(data.wasRemoved);
        setRemovalReason(data.removalReason || "");
      } else {
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

  const handleSignupClick = () => {
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

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const getAvailableSlots = (event) => {
    if (!event || !event.max_volunteers) return 0;
    return Math.max(0, event.max_volunteers - (event.registered_count || 0));
  };

  // In index.jsx - modify the confirmSignup function
  const confirmSignup = async () => {
    try {
      const response = await Api.registerForEvent(eventId);

      if (!response.ok) {
        const errorData = await response.json();

        // Check if the error is due to being previously removed
        if (errorData.wasRemoved) {
          setWasRemoved(true);
          setRemovalReason(
            errorData.removalReason || "Removed by event organizer"
          );
        }
        // NEW CHECK: Handle NRIC verification requirement
        else if (errorData.requiresVerification) {
          setError(
            "Your NRIC needs to be verified before you can sign up for events. Please visit your profile to submit your NRIC for verification."
          );
          setShowConfirmModal(false);
          return;
        }

        throw new Error(errorData.message || "Failed to sign up for event");
      }

      // Re-fetch the event to get the updated capacity count
      await fetchEventDetails();

      setIsSignedUp(true);
      setShowConfirmModal(false);
      setSignupSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSignupSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error signing up for event:", err);
      setError(err.message || "Failed to sign up for event. Please try again.");
      setShowConfirmModal(false);
    }
  };
  const cancelSignup = async () => {
    try {
      const response = await Api.removeEventSignup(eventId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel signup");
      }

      // Re-fetch the event to get the updated capacity count
      await fetchEventDetails();

      setIsSignedUp(false);
      setShowConfirmModal(false);
    } catch (err) {
      console.error("Error cancelling signup:", err);
      setError(err.message || "Failed to cancel signup. Please try again.");
    }
  };

  // Helper function to format date strings
  const formatDateRange = () => {
    if (event.start_date && event.end_date) {
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);

      const options = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
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

    return "Date information unavailable";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-lg">Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-6">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!event) {
    return (
      <Alert variant="destructive" className="my-6">
        <AlertDescription>
          Event not found or has been removed.
        </AlertDescription>
      </Alert>
    );
  }

  // Check if event is at capacity
  const isEventFull =
    event.max_volunteers > 0 &&
    (event.registered_count || 0) >= event.max_volunteers;

  // Render sidebar with registration options
  const renderRegisterSidebar = () => {
    return (
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="bg-white rounded-lg shadow-lg p-6">
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
          ) : user && isSignedUp ? (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-md text-base font-medium transition-colors"
            >
              Cancel Signup
            </button>
          ) : (
            <button
              onClick={handleSignupClick}
              disabled={event.status !== "active" || isEventFull || wasRemoved}
              className={`w-full py-3 px-4 rounded-md text-base font-medium transition-colors ${
                event.status !== "active" || isEventFull || wasRemoved
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {event.status !== "active"
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
                    width: `${
                      ((event.registered_count || 0) / event.max_volunteers) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-6">
      {/* Breadcrumb navigation */}
      <nav className="mb-5">
        <ol className="flex space-x-2 text-sm">
          <li>
            <a href="/" className="text-blue-600 hover:underline">
              Home
            </a>
          </li>
          <li className="flex items-center">
            <span className="mx-2 text-gray-400">/</span>
            <a href="/events" className="text-blue-600 hover:underline">
              Volunteer
            </a>
          </li>
          <li className="flex items-center">
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-600">{event.name}</span>
          </li>
        </ol>
      </nav>

      {/* Event header */}
      <div className="relative mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          {event.name}
        </h1>
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
          <span className="text-gray-700">
            {event.organiser_name || "Organization"}
          </span>
        </div>
        <div className="absolute top-0 right-0">
          <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Share className="h-4 w-4 mr-1" /> Share
          </button>
        </div>
      </div>

      {/* Registration success message */}
      {signupSuccess && (
        <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
          <AlertDescription>
            You have successfully signed up for this event!
          </AlertDescription>
        </Alert>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Event image */}
          <div className="relative w-full h-96 mb-6 rounded-lg overflow-hidden shadow-md">
            <img
              src={
                event.image_url
                  ? getEventImageUrl(event.image_url, imageTimestamp)
                  : `https://source.unsplash.com/random/800x400/?${
                      event.cause || "volunteer"
                    }`
              }
              alt={event.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Rest of the event details content */}
          {/* ... (rest of your component remains unchanged) ... */}
        </div>

        {/* Sidebar with registration */}
        {renderRegisterSidebar()}
      </div>

      {/* Reviews Section */}
      <div className="mb-10">
        <ReviewSection
          entityId={event.id}
          entityType="event"
          entityName={event.name}
          reviews={reviews}
          isLoading={reviewsLoading}
          maxShownReviews={2}
        />
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>
              {user && isSignedUp ? "Cancel Signup" : "Confirm Signup"}
            </DialogTitle>
            <DialogDescription>
              {user && isSignedUp ? (
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
                    <p className="font-medium">
                      <strong>Note:</strong> This is a recurring event. By
                      signing up, you are committing to attend all sessions
                      within the specified date range.
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
              variant={user && isSignedUp ? "destructive" : "default"}
              onClick={user && isSignedUp ? cancelSignup : confirmSignup}
              className={user && isSignedUp ? "" : "border-2 border-black"}
            >
              {user && isSignedUp ? "Confirm Cancellation" : "Confirm Signup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EventDetail;
