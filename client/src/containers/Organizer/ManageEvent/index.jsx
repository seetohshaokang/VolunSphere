// src/containers/Organizer/ManageEvent/index.jsx
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ContentHeader from "../../../components/ContentHeader";
import Api from "../../../helpers/Api";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

function OrganizerManageEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    cause: "",
    max_volunteers: 10,
    status: "active",

    // Single event fields
    date: "",
    start_time: "",
    end_time: "",

    // Recurring event fields
    is_recurring: false,
    recurrence_pattern: "weekly",
    recurrence_days: [1], // Default to Monday
    recurrence_start_date: "",
    recurrence_end_date: "",
    recurrence_time_start: "09:00",
    recurrence_time_end: "12:00",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      // Fetch event data for editing
      const fetchEventDetails = async () => {
        try {
          const response = await Api.getEvent(id);
          const eventData = await response.json();
          console.log("Fetched event data:", eventData);

          // Set current image URL if exists
          if (eventData.image_url) {
            setCurrentImageUrl(eventData.image_url);
            setImagePreview(eventData.image_url);
          }

          // Handle dates and times based on event type
          let date = "";
          let startTime = "";
          let endTime = "";
          let isRecurring = eventData.is_recurring || false;
          let recurrenceData = {};

          // For single events
          if (!isRecurring && eventData.start_datetime) {
            const startDateTime = new Date(eventData.start_datetime);
            date = startDateTime.toISOString().split("T")[0];
            startTime = startDateTime.toTimeString().slice(0, 5);

            if (eventData.end_datetime) {
              const endDateTime = new Date(eventData.end_datetime);
              endTime = endDateTime.toTimeString().slice(0, 5);
            }
          }

          // For recurring events
          if (isRecurring) {
            recurrenceData = {
              recurrence_pattern: eventData.recurrence_pattern || "weekly",
              recurrence_days: eventData.recurrence_days || [1],
              recurrence_start_date: eventData.recurrence_start_date
                ? new Date(eventData.recurrence_start_date)
                    .toISOString()
                    .split("T")[0]
                : "",
              recurrence_end_date: eventData.recurrence_end_date
                ? new Date(eventData.recurrence_end_date)
                    .toISOString()
                    .split("T")[0]
                : "",
              recurrence_time_start:
                eventData.recurrence_time?.start || "09:00",
              recurrence_time_end: eventData.recurrence_time?.end || "12:00",
            };
          }

          // Update form with event data
          setFormData({
            name: eventData.name || "",
            description: eventData.description || "",
            date: date,
            start_time: startTime,
            end_time: endTime,
            location: eventData.location || "",
            cause:
              eventData.causes && eventData.causes.length > 0
                ? eventData.causes[0]
                : "",
            max_volunteers: eventData.max_volunteers || 10,
            status: eventData.status || "active",
            is_recurring: isRecurring,
            ...recurrenceData,
          });
        } catch (err) {
          console.error("Error fetching event:", err);
          setError("Failed to load event data. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      fetchEventDetails();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? parseInt(value, 10) : value,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRecurringToggle = (checked) => {
    setFormData({
      ...formData,
      is_recurring: checked,
    });
  };

  const handleDayToggle = (day, checked) => {
    const currentDays = [...formData.recurrence_days];

    if (checked) {
      // Add the day if not present
      if (!currentDays.includes(day)) {
        currentDays.push(day);
      }
    } else {
      // Remove the day
      const index = currentDays.indexOf(day);
      if (index !== -1) {
        currentDays.splice(index, 1);
      }
    }

    // Ensure at least one day is selected
    if (currentDays.length > 0 || !checked) {
      setFormData({
        ...formData,
        recurrence_days: currentDays.sort((a, b) => a - b), // Sort numerically
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, JPG, PNG, GIF, WEBP)");
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setImageFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(isEditMode ? currentImageUrl : null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);

    try {
      // Prepare the data for submission
      const eventData = { ...formData };

      // Format the data differently based on whether it's recurring or not
      if (eventData.is_recurring) {
        // For recurring events, format the recurrence data
        eventData.recurrence_time = {
          start: eventData.recurrence_time_start,
          end: eventData.recurrence_time_end,
        };

        // Remove single event fields
        delete eventData.date;
        delete eventData.start_time;
        delete eventData.end_time;
      } else {
        // For single events, we need to reformat to match the expected backend format
        eventData.start_date = eventData.date;
        eventData.end_date = eventData.date; // Same date for non-recurring events

        // Remove date field as it's not expected by the backend
        delete eventData.date;

        // Remove recurring fields
        delete eventData.recurrence_pattern;
        delete eventData.recurrence_days;
        delete eventData.recurrence_start_date;
        delete eventData.recurrence_end_date;
        delete eventData.recurrence_time_start;
        delete eventData.recurrence_time_end;
      }

      // Fix the data format for causes
      eventData.causes = eventData.cause ? [eventData.cause] : [];
      delete eventData.cause;

      // Remove helper fields
      delete eventData.recurrence_time_start;
      delete eventData.recurrence_time_end;

      console.log("Submitting event data:", eventData);

      if (isEditMode) {
        // Update existing event
        const response = await Api.updateEvent(id, eventData, imageFile);

        if (response.ok) {
          navigate("/organizer");
        } else {
          const data = await response.json();
          setError(data.message || "Failed to update event");
        }
      } else {
        // Create new event
        const response = await Api.createEvent(eventData, imageFile);

        if (response.ok) {
          navigate("/organizer");
        } else {
          const data = await response.json();
          setError(data.message || "Failed to create event");
        }
      }
    } catch (err) {
      console.error("Error saving event:", err);
      setError("Failed to save event. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <ContentHeader
        title={isEditMode ? "Edit Event" : "Create New Event"}
        links={[
          { to: "/", label: "Home" },
          { to: "/organizer", label: "Events" },
          {
            label: isEditMode ? "Edit Event" : "Create Event",
            isActive: true,
          },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditMode ? "Edit Event Details" : "Create New Event"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Event Title</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter event title"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows="3"
                placeholder="Event description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label>Event Image</Label>
              <div className="mt-1 flex flex-col gap-2">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative mb-2">
                    <img
                      src={imagePreview}
                      alt="Event preview"
                      className="w-full max-h-64 object-cover rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      Remove
                    </Button>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleImageChange}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                />

                {/* Upload button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={triggerFileInput}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {imagePreview ? "Change Image" : "Upload Image"}
                </Button>

                <p className="text-sm text-gray-500">
                  Recommended size: 1200x800px. Max size: 5MB. Supported
                  formats: JPEG, PNG, GIF, WEBP.
                </p>
              </div>
            </div>

            {/* Event Type Selection */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_recurring"
                  checked={formData.is_recurring}
                  onCheckedChange={handleRecurringToggle}
                />
                <Label htmlFor="is_recurring" className="cursor-pointer">
                  This is a recurring event
                </Label>
              </div>
              <p className="text-sm text-gray-500">
                {formData.is_recurring
                  ? "This event repeats on a regular schedule"
                  : "This is a one-time event"}
              </p>
            </div>

            {/* Conditional fields based on event type */}
            {formData.is_recurring ? (
              // Recurring Event Fields
              <>
                <div className="space-y-2">
                  <Label htmlFor="recurrence_pattern">Recurrence Pattern</Label>
                  <Select
                    value={formData.recurrence_pattern}
                    onValueChange={(value) =>
                      handleSelectChange("recurrence_pattern", value)
                    }
                  >
                    <SelectTrigger id="recurrence_pattern">
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Only show days selection for weekly or custom patterns */}
                {(formData.recurrence_pattern === "weekly" ||
                  formData.recurrence_pattern === "custom") && (
                  <div className="space-y-2">
                    <Label>Recurring Days</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
                      {DAYS_OF_WEEK.map((day) => (
                        <div
                          key={day.value}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={`day-${day.value}`}
                            checked={formData.recurrence_days.includes(
                              day.value
                            )}
                            onCheckedChange={(checked) =>
                              handleDayToggle(day.value, checked)
                            }
                          />
                          <Label
                            htmlFor={`day-${day.value}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {day.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recurrence_start_date">Start Date</Label>
                    <Input
                      id="recurrence_start_date"
                      name="recurrence_start_date"
                      type="date"
                      value={formData.recurrence_start_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recurrence_end_date">End Date</Label>
                    <Input
                      id="recurrence_end_date"
                      name="recurrence_end_date"
                      type="date"
                      value={formData.recurrence_end_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recurrence_time_start">Start Time</Label>
                    <Input
                      id="recurrence_time_start"
                      name="recurrence_time_start"
                      type="time"
                      value={formData.recurrence_time_start}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recurrence_time_end">End Time</Label>
                    <Input
                      id="recurrence_time_end"
                      name="recurrence_time_end"
                      type="time"
                      value={formData.recurrence_time_end}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              // Single Event Fields
              <>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      name="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      name="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="Event location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cause">Category</Label>
              <Select
                value={formData.cause}
                onValueChange={(value) => handleSelectChange("cause", value)}
                required
              >
                <SelectTrigger id="cause">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Environment">Environment</SelectItem>
                  <SelectItem value="Social Services">
                    Social Services
                  </SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Animal Welfare">Animal Welfare</SelectItem>
                  <SelectItem value="Community Development">
                    Community Development
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_volunteers">Volunteer Slots</Label>
              <Input
                id="max_volunteers"
                name="max_volunteers"
                type="number"
                min="1"
                value={formData.max_volunteers}
                onChange={handleChange}
                required
              />
            </div>

            {isEditMode && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <CardFooter className="flex justify-end gap-2 px-0 pt-4">
              <Button variant="outline" asChild>
                <Link to="/organizer">Cancel</Link>
              </Button>
              <Button type="submit" disabled={submitLoading}>
                {submitLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full"></div>
                    {isEditMode ? "Updating..." : "Creating..."}
                  </div>
                ) : (
                  <>{isEditMode ? "Update Event" : "Create Event"}</>
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export default OrganizerManageEvent;
