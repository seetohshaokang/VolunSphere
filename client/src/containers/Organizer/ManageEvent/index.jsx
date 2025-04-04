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
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ContentHeader from "../../../components/ContentHeader";
import Api from "../../../helpers/Api";

function OrganizerManageEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    location: "",
    cause: "",
    max_volunteers: 10,
    status: "active",
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

          // Set current image URL if exists
          if (eventData.image_url) {
            setCurrentImageUrl(eventData.image_url);
            setImagePreview(eventData.image_url);
          }

          // Parse dates for form
          let startDate = "";
          let endDate = "";
          let startTime = "";
          let endTime = "";

          if (eventData.start_datetime) {
            const startDateTime = new Date(eventData.start_datetime);
            startDate = startDateTime.toISOString().split("T")[0];
            startTime = startDateTime.toTimeString().slice(0, 5);
          }

          if (eventData.end_datetime) {
            const endDateTime = new Date(eventData.end_datetime);
            endDate = endDateTime.toISOString().split("T")[0];
            endTime = endDateTime.toTimeString().slice(0, 5);
          }

          // Update form with event data
          setFormData({
            name: eventData.name || "",
            description: eventData.description || "",
            start_date: startDate,
            end_date: endDate,
            start_time: startTime,
            end_time: endTime,
            location: eventData.location || "",
            cause:
              eventData.causes && eventData.causes.length > 0
                ? eventData.causes[0]
                : "",
            max_volunteers: eventData.max_volunteers || 10,
            status: eventData.status || "active",
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
      if (isEditMode) {
        // Update existing event
        const response = await Api.updateEvent(id, formData, imageFile);

        if (response.ok) {
          navigate("/organizer");
        } else {
          const data = await response.json();
          setError(data.message || "Failed to update event");
        }
      } else {
        // Create new event
        const response = await Api.createEvent(formData, imageFile);

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
              </div>
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
                />
              </div>
            </div>

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
