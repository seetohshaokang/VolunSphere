import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CalendarIcon,
  MapPinIcon,
  PencilIcon,
  ClockIcon,
  RepeatIcon,
  UsersIcon,
  Trash,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ContentHeader from "../../../components/ContentHeader";
import { useAuth } from "../../../contexts/AuthContext";
import Api from "../../../helpers/Api";
import EventVolunteersModal from "@/components/EventVolunteersModal.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

function OrganizerEventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [editedEvent, setEditedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(false);
  const [showVolunteersModal, setShowVolunteersModal] = useState(false);
  const [rawEventData, setRawEventData] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch the event data from the API
        const response = await Api.getEvent(eventId);

        // Check for auth issues
        if (response.status === 401) {
          setAuthError(true);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`Error fetching event: ${response.status}`);
        }

        const eventData = await response.json();
        console.log("Raw event data:", eventData);

        // Store the raw event data for reference
        setRawEventData(eventData);

        // Format dates properly
        let formattedStartDate = "";
        let formattedEndDate = "";
        let recurrenceInfo = null;

        if (eventData.start_datetime) {
          formattedStartDate = new Date(
            eventData.start_datetime
          ).toLocaleDateString();
        }

        if (eventData.end_datetime) {
          formattedEndDate = new Date(
            eventData.end_datetime
          ).toLocaleDateString();
        }

        // For recurring events
        if (eventData.is_recurring) {
          if (eventData.recurrence_start_date) {
            formattedStartDate = new Date(
              eventData.recurrence_start_date
            ).toLocaleDateString();
          }
          if (eventData.recurrence_end_date) {
            formattedEndDate = new Date(
              eventData.recurrence_end_date
            ).toLocaleDateString();
          }

          recurrenceInfo = {
            pattern: eventData.recurrence_pattern || "weekly",
            days: eventData.recurrence_days || [],
            timeStart: eventData.recurrence_time?.start || "09:00",
            timeEnd: eventData.recurrence_time?.end || "17:00",
          };
        }

        // Format date string
        const dateString = formattedStartDate
          ? formattedEndDate
            ? `${formattedStartDate} - ${formattedEndDate}`
            : formattedStartDate
          : "Date not specified";

        // Transform the API data to match our component's expected format
        const formattedEvent = {
          id: eventData._id || eventData.id,
          title: eventData.name || "Event Name",
          organizer: eventData.organiser_name || "Your Organization",
          date: dateString,
          specificDates: formattedStartDate ? [formattedStartDate] : [],
          location: eventData.location || "Location not specified",
          category:
            eventData.causes && eventData.causes.length > 0
              ? eventData.causes[0]
              : "General",
          tags: eventData.causes || ["Volunteer"],
          remainingSlots: eventData.max_volunteers - eventData.registered_count,
          totalSlots: eventData.max_volunteers || 0,
          description: eventData.description || "No description provided",
          contactPerson: eventData.contact_person || "Event Coordinator",
          contactEmail:
            eventData.contact_email ||
            user?.email ||
            "contact@organization.com",
          imageUrl: eventData.image_url || "/src/assets/default-event.jpg",
          status: eventData.status || "active",
          isRecurring: eventData.is_recurring || false,
          recurrenceInfo: recurrenceInfo,
          // For single events
          startTime: eventData.start_datetime
            ? new Date(eventData.start_datetime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          endTime: eventData.end_datetime
            ? new Date(eventData.end_datetime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
        };

        setEvent(formattedEvent);
        setEditedEvent(formattedEvent);
      } catch (error) {
        console.error("Error fetching event details:", error);
        setError("Failed to load event details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, user?.email]);

  // Add this after your state declarations
  const fetchUpdatedEvent = async () => {
    try {
      console.log("Fetching fresh event data after volunteer removal");
      const response = await Api.getEvent(eventId);

      if (!response.ok) {
        throw new Error(`Error fetching event: ${response.status}`);
      }

      const eventData = await response.json();
      console.log("Updated event data:", eventData);
      console.log("Updated registered count:", eventData.registered_count);

      // Store the raw event data for reference
      setRawEventData(eventData);

      // Format dates properly and update the event state
      // (Reusing the same logic you have in your initial useEffect)
      let formattedStartDate = "";
      let formattedEndDate = "";
      let recurrenceInfo = null;

      if (eventData.start_datetime) {
        formattedStartDate = new Date(
          eventData.start_datetime
        ).toLocaleDateString();
      }

      if (eventData.end_datetime) {
        formattedEndDate = new Date(
          eventData.end_datetime
        ).toLocaleDateString();
      }

      // For recurring events
      if (eventData.is_recurring) {
        // Your existing recurring event logic
        // ...
      }

      // Format date string
      const dateString = formattedStartDate
        ? formattedEndDate
          ? `${formattedStartDate} - ${formattedEndDate}`
          : formattedStartDate
        : "Date not specified";

      // Transform the API data to match our component's expected format
      const formattedEvent = {
        id: eventData._id || eventData.id,
        title: eventData.name || "Event Name",
        // Include all other fields as in your original code
        // ...
        remainingSlots: eventData.max_volunteers
          ? eventData.max_volunteers - (eventData.registered_count || 0)
          : 0,
        totalSlots: eventData.max_volunteers || 0,
        // ... rest of your event fields
      };

      setEvent(formattedEvent);
      setEditedEvent(formattedEvent);
    } catch (err) {
      console.error("Error refreshing event data:", err);
    }
  };

  const calculateFilledSpots = (totalSlots, remainingSlots) => {
    const filledSpots = Math.max(0, totalSlots - remainingSlots);
    console.log(
      `Calculating filled spots: ${filledSpots} = ${totalSlots} - ${remainingSlots}`
    );
    return filledSpots;
  };

  // In the parent component, modify the refreshEventData function to completely re-fetch
  // Simplest refresh function possible
  const refreshEventData = async () => {
    try {
      const response = await Api.getEvent(eventId);
      if (response.ok) {
        const updatedEvent = await response.json();

        // Update the event state with the latest data
        setEvent({
          ...event,
          registered_count: updatedEvent.registered_count,
        });

        console.log(
          "Event data refreshed, new registered count:",
          updatedEvent.registered_count
        );
      }
    } catch (error) {
      console.error("Failed to refresh event data:", error);
    }
  };
  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await Api.deleteEvent(eventId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete event");
      }

      // Redirect to events list after successful deletion
      navigate("/organizer");
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("Failed to delete event. Please try again.");
    } finally {
      setLoading(false);
      setShowDeleteConfirmModal(false);
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

  // Edit Mode functions
  const toggleEditMode = () => {
    if (isEditing) {
      setEditedEvent(event);
    }
    setIsEditing(!isEditing);
  };

  const handleEditField = (field, value) => {
    setEditedEvent({
      ...editedEvent,
      [field]: value,
    });
  };

  const saveEventChanges = () => {
    setShowConfirmModal(true);
  };

  const confirmSaveChanges = async () => {
    try {
      // Convert the edited data to the format expected by the API
      const apiEventData = {
        name: editedEvent.title,
        description: editedEvent.description,
        location: editedEvent.location,
        cause: editedEvent.category,
        max_volunteers: editedEvent.totalSlots,
        status: editedEvent.status,
        contact_person: editedEvent.contactPerson,
        contact_email: editedEvent.contactEmail,
      };

      // In a real implementation, uncomment this to actually update the event
      // const response = await Api.updateEvent(event.id, apiEventData);
      // if (!response.ok) throw new Error("Failed to update event");

      setEvent(editedEvent);
      setIsEditing(false);
      setShowConfirmModal(false);
      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error updating event:", err);
      setError("Failed to update event. Please try again.");
      setShowConfirmModal(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-lg">Loading event details...</p>
      </div>
    );
  }

  // Auth error state
  if (authError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5 mr-2" />
          <AlertDescription>
            You need to be logged in to view this page. Please log in and try
            again.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={() => navigate("/organizer")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // No event found state
  if (!event) {
    return (
      <Alert variant="destructive" className="my-6">
        <AlertDescription>
          Event not found or has been removed.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ContentHeader
        title={event.title}
        links={[
          { to: "/organizer", label: "Home" },
          { label: event.title, isActive: true },
        ]}
      />

      {/* Event header with edit button */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            {event.title}
          </h1>
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
            <span className="text-gray-600">{event.organizer}</span>
          </div>

          <div className="mt-2 flex gap-2">
            <Badge
              className={
                event.status === "active"
                  ? "bg-green-100 text-green-800"
                  : event.status === "draft"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {event.status.toUpperCase()}
            </Badge>

            {event.isRecurring && (
              <Badge className="bg-blue-100 text-blue-800">RECURRING</Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row mt-4 md:mt-0 gap-3">
          <div className="flex gap-3">
            {event.status !== "completed" ? (
              <Button
                asChild
                variant="outline"
                className="flex items-center gap-2 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700 hover:border-blue-300 shadow-sm px-4 py-2"
              >
                <Link to={`/events/edit/${eventId}`}>
                  <PencilIcon className="h-4 w-4" /> Edit Event
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled
                className="flex items-center gap-2 bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed px-4 py-2"
                title="Completed events cannot be edited"
              >
                <PencilIcon className="h-4 w-4" /> Edit Event
              </Button>
            )}

            {event.status !== "completed" ? (
              <Button
                onClick={() => setShowDeleteConfirmModal(true)}
                variant="outline"
                className="flex items-center gap-2 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 hover:border-red-300 shadow-sm px-4 py-2"
              >
                <Trash className="h-4 w-4" /> Delete Event
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled
                className="flex items-center gap-2 bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed px-4 py-2"
                title="Completed events cannot be deleted"
              >
                <Trash className="h-4 w-4" /> Delete Event
              </Button>
            )}

            <Button
              asChild
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm px-4 py-2"
            >
              <Link to={`/organizer/events/${eventId}/volunteers`}>
                <Users className="h-4 w-4" /> View Volunteers
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Success message */}
      {saveSuccess && (
        <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
          <AlertDescription>
            Event details have been updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Main content */}
      <Card className="mb-6 shadow-sm">
        <CardContent className="p-6">
          {isEditing ? (
            /* Edit mode */
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={editedEvent.title}
                  onChange={(e) => handleEditField("title", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="organizer">Organizer</Label>
                  <Input
                    id="organizer"
                    value={editedEvent.organizer}
                    onChange={(e) =>
                      handleEditField("organizer", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={editedEvent.category}
                    onValueChange={(value) =>
                      handleEditField("category", value)
                    }
                  >
                    <SelectTrigger id="category" className="mt-1">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Environment">Environment</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Arts & Culture">
                        Arts & Culture
                      </SelectItem>
                      <SelectItem value="Animal Welfare">
                        Animal Welfare
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="date">Schedule</Label>
                <Input
                  id="date"
                  value={editedEvent.date}
                  onChange={(e) => handleEditField("date", e.target.value)}
                  className="mt-1"
                  disabled
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Change dates in the event management page
                </p>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editedEvent.location}
                  onChange={(e) => handleEditField("location", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={editedEvent.description}
                  onChange={(e) =>
                    handleEditField("description", e.target.value)
                  }
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="totalSlots">Total Available Slots</Label>
                  <Input
                    id="totalSlots"
                    type="number"
                    value={editedEvent.totalSlots}
                    onChange={(e) =>
                      handleEditField("totalSlots", parseInt(e.target.value))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="remainingSlots">Remaining Slots</Label>
                  <Input
                    id="remainingSlots"
                    type="number"
                    value={editedEvent.remainingSlots}
                    onChange={(e) =>
                      handleEditField(
                        "remainingSlots",
                        parseInt(e.target.value)
                      )
                    }
                    className="mt-1"
                    disabled
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on registrations
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={editedEvent.contactPerson}
                    onChange={(e) =>
                      handleEditField("contactPerson", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={editedEvent.contactEmail}
                    onChange={(e) =>
                      handleEditField("contactEmail", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Event Status</Label>
                <Select
                  value={editedEvent.status}
                  onValueChange={(value) => handleEditField("status", value)}
                >
                  <SelectTrigger id="status" className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            /* View mode */
            <>
              {/* Banner image */}
              <div className="mb-6">
                <img
                  src={event.imageUrl || "/src/assets/default-event.jpg"}
                  alt={event.title}
                  className="w-full h-64 object-cover rounded-md shadow-sm"
                />
              </div>

              {/* Event key information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start">
                  <CalendarIcon className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Schedule</h3>
                    <p className="text-gray-700">{event.date}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Location</h3>
                    <p className="text-gray-700">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <UsersIcon className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold mb-1">
                      Registrations
                    </h3>
                    <p className="text-gray-700">
                      {calculateFilledSpots(
                        event.totalSlots,
                        event.remainingSlots
                      )}{" "}
                      of {event.totalSlots} spots filled
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{event.description}</p>
              </div>

              {/* Event timing details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Event Schedule</h3>

                {event.isRecurring ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <RepeatIcon className="h-5 w-5 text-primary" />
                      <span className="font-medium">Recurring Event:</span>
                      <span className="capitalize">
                        {event.recurrenceInfo?.pattern || "Weekly"}
                      </span>
                    </div>

                    {(event.recurrenceInfo?.pattern === "weekly" ||
                      event.recurrenceInfo?.pattern === "custom") &&
                      event.recurrenceInfo?.days?.length > 0 && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <CalendarIcon className="h-5 w-5 text-primary" />
                          <span className="font-medium">Recurring Days:</span>
                          <span>
                            {formatRecurringDays(event.recurrenceInfo.days)}
                          </span>
                        </div>
                      )}

                    <div className="flex items-center gap-2 text-gray-700">
                      <ClockIcon className="h-5 w-5 text-primary" />
                      <span className="font-medium">Event Time:</span>
                      <span>
                        {formatTime(event.recurrenceInfo?.timeStart)} -{" "}
                        {formatTime(event.recurrenceInfo?.timeEnd)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      <span className="font-medium">Date:</span>
                      <span>{event.date}</span>
                    </div>

                    {(event.startTime || event.endTime) && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <ClockIcon className="h-5 w-5 text-primary" />
                        <span className="font-medium">Time:</span>
                        <span>
                          {event.startTime} - {event.endTime}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Contact Information
                </h3>
                <p className="text-gray-700">
                  <span className="font-medium">Contact Person:</span>{" "}
                  {event.contactPerson}
                  <br />
                  <span className="font-medium">Email:</span>{" "}
                  {event.contactEmail}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Confirm Changes</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to save the changes to this event? This will
              update the information shown to volunteers.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmSaveChanges}
                className="border-2 border-black"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={showDeleteConfirmModal}
        onOpenChange={setShowDeleteConfirmModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Event Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be
              undone.
              {event?.remainingSlots !== event?.totalSlots && (
                <p className="mt-2 text-red-500 font-semibold">
                  Warning: This event has{" "}
                  {event?.totalSlots - event?.remainingSlots} volunteer(s)
                  registered. Deleting it will cancel all registrations.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OrganizerEventDetail;
