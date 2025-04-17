import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Eye, Loader2, PenSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ContentHeader from "../../../components/ContentHeader";
import DocumentUploader from "../../../components/DocumentUploader";
import { useAuth } from "../../../contexts/AuthContext";
import Api from "../../../helpers/Api";

function Profile() {
  const { user, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [events, setEvents] = useState([]);
  const [fetchingEvents, setFetchingEvents] = useState(false);
  const [eventsError, setEventsError] = useState(null);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    bio: "",
    avatar: null,
    avatarFile: null,
    skills: [],
    address: "",
    website: "",
    organisation_name: "",
    certification_document: null,
    verification_status: "pending",
  });

  const [nricFile, setNricFile] = useState(null);
  const [uploadingNric, setUploadingNric] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    fetchUserProfile();
    fetchUserEvents();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await Api.getUserProfile({
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }

      const data = await response.json();
      console.log("Profile data received:", data); // Add this for debugging

      // Create a default profile data structure
      const profileData = {
        firstName: "",
        lastName: "",
        email: data.user.email || "Email not provided",
        phone: data.profile.phone || "",
        bio: "",
        avatar: data.profile.profile_picture_url,
        address: data.profile.address || "",
        website: "",
        certification_document: null,
        verification_status: "pending",
      };

      // Handle role-specific data mapping
      if (data.user.role === "volunteer") {
        // For volunteer, parse the name
        let fullName = data.profile.name || "";
        if (fullName.includes(" ")) {
          const nameParts = fullName.split(" ");
          profileData.firstName = nameParts[0];
          profileData.lastName = nameParts.slice(1).join(" ");
        } else {
          profileData.firstName = fullName;
        }

        profileData.bio = data.profile.bio || "";
        profileData.dob = data.profile.dob
          ? formatDateForInput(data.profile.dob)
          : "";
        profileData.skills = data.profile.skills || [];
        profileData.nric_image = data.profile.nric_image || null;
        profileData.preferred_causes = data.profile.preferred_causes || [];
      } else if (data.user.role === "organiser") {
        // For organizer, company name goes into firstName
        profileData.firstName = data.profile.name || "";
        profileData.bio = data.profile.description || ""; // Use description field for organizers
        profileData.website = data.profile.website || "";
        profileData.certification_document =
          data.profile.certification_document || null;
        profileData.verification_status =
          data.profile.verification_status || "pending";
      }

      setProfile(profileData);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEvents = async () => {
    if (!user) {
      return;
    }

    setEvents([]);
    setFetchingEvents(true);
    setEventsError(null);

    try {
      const response = await Api.getUserEvents();

      if (!response.ok) {
        throw new Error(`Failed to fetch events for ${user.role}`);
      }

      const data = await response.json();
      const eventsData = data.events || [];

      if (!Array.isArray(eventsData)) {
        setEventsError("Invalid data format received from server");
        return;
      }

      if (eventsData.length === 0) {
        setEvents([]);
        return;
      }

      if (user.role === "volunteer") {
        // For volunteers, enhance each event with registration status
        const enhancedEvents = eventsData
          .map((event) => {
            if (!event) return null;

            // Determine if this is a volunteer registration or event
            const eventObj = event.event || event;
            const status = eventObj?.status || "active";

            // For volunteer registrations, get the registration status
            const registrationStatus =
              event.registration_status || event.status || "registered";

            // Enhance the event object with registration_status for display
            return {
              ...event,
              registration_status: registrationStatus,
            };
          })
          .filter(Boolean); // Remove any null values

        setEvents(enhancedEvents);
      } else {
        // For organizers, just set all events
        setEvents(eventsData);
      }
    } catch (err) {
      setEventsError(`Failed to load volunteer activities: ${err.message}`);
    } finally {
      setFetchingEvents(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for display purposes
      const imageUrl = URL.createObjectURL(file);
      setProfile({ ...profile, avatar: imageUrl, avatarFile: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create FormData for the API call
      const formData = new FormData();
      formData.append(
        "name",
        `${profile.firstName} ${profile.lastName}`.trim()
      );
      formData.append("phone", profile.phone);
      formData.append("bio", profile.bio);
      formData.append("dob", profile.dob);
      formData.append("address", profile.address);

      if (profile.avatarFile) {
        formData.append("profile_picture", profile.avatarFile);
      }

      if (
        user.role === "volunteer" &&
        profile.skills &&
        profile.skills.length > 0
      ) {
        formData.append("skills", JSON.stringify(profile.skills));
      }

      const data = await Api.updateUserProfile(formData);

      if (!data || !data.profile) {
        throw new Error("Failed to update profile");
      }

      setImageTimestamp(Date.now());
      setSuccess("Profile updated successfully!");
      setIsEditing(false);

      // Update the profile data in the auth context
      if (typeof refreshProfile === "function") {
        refreshProfile();
      }

      fetchUserProfile();
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNricFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNricFile(file);
    }
  };

  const handleNricUpload = async () => {
    if (!nricFile) return;
    setUploadingNric(true);
    setError(null);
    setSuccess(null);

    try {
      // Create Form Data for the API call
      const formData = new FormData();
      formData.append("nric_image", nricFile);

      const response = await Api.uploadNRIC(formData);

      if (response.ok) {
        const data = await response.json();
        setSuccess(
          data.message ||
            "NRIC uploaded successfully. It will be verified by an adminstrator."
        );
        setNricFile(null);
        // Refresh profile data to show updated NRIC status
        fetchUserProfile();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to upload NRIC");
      }
    } catch (err) {
      setError("Failed to upload NRIC. Please try again.");
    } finally {
      setUploadingNric(false);
    }
  };

  if (loading && !profile.email) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  // Function to handle avatar URL with potential cache busting
  const getAvatarUrl = () => {
    if (!profile.avatar) {
      return user?.role === "organiser"
        ? "/src/assets/default-avatar-red.png"
        : "/src/assets/default-avatar-blue.png";
    }

    // If it's a full URL
    if (profile.avatar.startsWith("http")) {
      return `${profile.avatar}?t=${imageTimestamp}`;
    }

    // If it's a relative path with a file extension
    if (profile.avatar.startsWith("/") || profile.avatar.includes(".")) {
      // Determine if it's a server-hosted image or a local asset
      if (
        profile.avatar.startsWith("/uploads/") ||
        profile.avatar.includes("profile-")
      ) {
        return `http://localhost:8000${
          profile.avatar.startsWith("/") ? "" : "/uploads/profiles/"
        }${profile.avatar}?t=${imageTimestamp}`;
      }
      return `${profile.avatar}?t=${imageTimestamp}`;
    }

    // If it's just a filename (most likely from server)
    return `http://localhost:8000/uploads/profiles/${profile.avatar}?t=${imageTimestamp}`;
  };

  // Helper function to determine registration status badge variant
  const getRegistrationStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "registered":
        return "default"; // Blue badge
      case "confirmed":
        return "default"; // Blue badge
      case "completed":
        return "success"; // Green badge
      case "cancelled":
        return "destructive"; // Red badge
      case "not_attended":
        return "outline"; // Outline badge
      case "attended":
        return "success"; // Green badge
      case "pending":
        return "outline"; // Outline badge
      case "removed_by_organizer":
        return "destructive"; // Red badge
      default:
        return "outline"; // Default fallback
    }
  };

  // Helper function to format registration status for display
  const formatRegistrationStatus = (status) => {
    if (!status) return "REGISTERED";

    // Check if the event is completed based on date
    if (
      status.toLowerCase() === "confirmed" ||
      status.toLowerCase() === "registered"
    ) {
      const eventDate = new Date();
      const now = new Date();

      // If event date is in the past, mark as COMPLETED
      if (eventDate < now) {
        return "COMPLETED";
      }
    }

    // Override specific status values for cleaner display
    switch (status.toLowerCase()) {
      case "confirmed":
        return "REGISTERED";
      case "not_attended":
        return "NOT ATTENDED";
      case "attended":
        return "COMPLETED";
      case "removed_by_organizer":
        return "REMOVED";
      default:
        // Replace underscores with spaces and capitalize
        return status.replace(/_/g, " ").toUpperCase();
    }
  };

  // Helper function to determine if an event is completed based on date
  const isEventCompleted = (event) => {
    if (!event) return false;

    // Find the first valid date from all the possible date fields
    const dateField =
      event.end_datetime ||
      event.start_datetime ||
      event.date ||
      event.start_date ||
      (event.event
        ? event.event.end_datetime ||
          event.event.start_datetime ||
          event.event.date ||
          event.event.start_date
        : null);

    if (!dateField) return false;

    const eventDate = new Date(dateField);
    if (isNaN(eventDate.getTime())) {
      return false;
    }

    const now = new Date();
    return eventDate < now;
  };

  // Helper function to get event status for display
  const getEventStatus = (event) => {
    // First check registration status if available
    if (event.registration_status) {
      if (
        event.registration_status.toLowerCase() === "confirmed" ||
        event.registration_status.toLowerCase() === "registered"
      ) {
        // Check if event is completed based on date
        if (isEventCompleted(event)) {
          return "completed";
        }
        return "registered";
      }
      return event.registration_status;
    }

    // If no registration status, derive from event status and date
    if (isEventCompleted(event)) {
      return "completed";
    }

    return "registered";
  };

  return (
    <div className="min-h-screen">
      {/* Main content container with width constraints matching main page */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        <ContentHeader
          title="My Profile"
          links={[
            { to: "/organizer", label: "Home" },
            { label: "Profile", isActive: true },
          ]}
          className="mt-8 mb-8"
        />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 border-4 border-primary">
                <AvatarImage src={getAvatarUrl()} alt="User profile" />
                <AvatarFallback>
                  {profile.firstName?.charAt(0) || ""}
                  {profile.lastName?.charAt(0) || ""}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold mt-4">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {user?.role === "volunteer" ? "Volunteer" : "Event Organizer"}
              </p>
              {user?.role === "volunteer" &&
                profile.skills &&
                profile.skills.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Personal Information</CardTitle>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit Profile
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="space-y-3">
                  {user?.role === "volunteer" ? (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="font-bold">Name:</span>
                        <span className="col-span-2">
                          {profile.firstName} {profile.lastName}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="font-bold">Date of Birth:</span>
                        <span className="col-span-2">
                          {profile.dob
                            ? new Date(profile.dob).toLocaleDateString()
                            : "Not provided"}
                        </span>
                      </div>
                    </>
                  ) : (
                    // For organiser
                    <div className="grid grid-cols-3 gap-4">
                      <span className="font-bold">Company Name:</span>
                      <span className="col-span-2">{profile.firstName}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <span className="font-bold">Email:</span>
                    <span className="col-span-2">{profile.email}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <span className="font-bold">Phone:</span>
                    <span className="col-span-2">
                      {profile.phone || "Not provided"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <span className="font-bold">Address:</span>
                    <span className="col-span-2">
                      {profile.address || "Not provided"}
                    </span>
                  </div>

                  {user?.role === "volunteer" ? (
                    <div className="grid grid-cols-3 gap-4">
                      <span className="font-bold">Bio:</span>
                      <span className="col-span-2">
                        {profile.bio || "No bio provided"}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="font-bold">Description:</span>
                        <span className="col-span-2">
                          {profile.bio || "No description provided"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <span className="font-bold">Website:</span>
                        <span className="col-span-2">
                          {profile.website ? (
                            <a
                              href={profile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {profile.website}
                            </a>
                          ) : (
                            "Not provided"
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="avatar">Profile Picture</Label>
                      <div className="flex flex-col space-y-2">
                        {profile.avatar && (
                          <div className="flex justify-center my-2">
                            <Avatar className="w-20 h-20 border-2 border-primary">
                              <AvatarImage
                                src={
                                  profile.avatarFile
                                    ? URL.createObjectURL(profile.avatarFile)
                                    : getAvatarUrl()
                                }
                                alt="Profile preview"
                              />
                              <AvatarFallback>
                                {profile.firstName?.charAt(0) || ""}
                                {profile.lastName?.charAt(0) || ""}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                        <div className="relative">
                          <div className="flex items-center gap-2">
                            <label
                              htmlFor="avatar"
                              className="border border-input bg-background rounded-md px-3 py-2 text-sm cursor-pointer inline-block min-w-24 text-center hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                              Choose file
                            </label>
                            <span className="text-sm text-gray-600">
                              {profile.avatarFile
                                ? profile.avatarFile.name
                                : "No file chosen"}
                            </span>
                            <Input
                              id="avatar"
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Accepted formats: JPEG, PNG, WebP. Max size: 5MB.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Conditional rendering based on user role */}
                    {user?.role === "volunteer" ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={profile.firstName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={profile.lastName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        {/* Date of Birth only for volunteers */}
                        <div className="space-y-2">
                          <Label htmlFor="dob">Date of Birth</Label>
                          <Input
                            id="dob"
                            name="dob"
                            type="date"
                            value={profile.dob}
                            onChange={handleChange}
                          />
                        </div>
                      </>
                    ) : (
                      // For organiser
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Company Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={profile.firstName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    )}

                    {/* Common fields for both roles */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profile.email}
                        onChange={handleChange}
                        required
                        disabled
                      />
                      <p className="text-sm text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={profile.address}
                        onChange={handleChange}
                      />
                    </div>

                    {user?.role === "volunteer" ? (
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={profile.bio}
                          onChange={handleChange}
                          rows={4}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Description</Label>
                          <Textarea
                            id="bio"
                            name="bio"
                            value={profile.bio}
                            onChange={handleChange}
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website URL</Label>
                          <Input
                            id="website"
                            name="website"
                            type="url"
                            placeholder="https://yourorganization.com"
                            value={profile.website}
                            onChange={handleChange}
                          />
                        </div>
                      </>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="border-2 border-black"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <DocumentUploader
            profile={profile}
            onUploadSuccess={fetchUserProfile}
            setError={setError}
            setSuccess={setSuccess}
            isOrganizer={user?.role === "organiser"}
          />

          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>
                {user?.role === "volunteer"
                  ? "My Volunteer Activities"
                  : "My Organized Events"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{eventsError}</AlertDescription>
                </Alert>
              )}

              {fetchingEvents && (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading activities...</span>
                </div>
              )}

              {!fetchingEvents && Array.isArray(events) && events.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-left">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event, index) => {
                      if (!event) return null;

                      const eventName =
                        event.name || event.event?.name || "Unnamed Event";

                      const eventDate =
                        event.start_datetime ||
                        event.end_datetime ||
                        event.start_date ||
                        event.event?.start_date ||
                        event.date;

                      const eventId =
                        event._id ||
                        event.event?._id ||
                        event.event_id ||
                        `event-${index}`;

                      const status = getEventStatus(event);

                      return (
                        <TableRow key={eventId}>
                          <TableCell className="font-medium">
                            {eventName}
                          </TableCell>
                          <TableCell>
                            {eventDate
                              ? new Date(eventDate).toLocaleDateString()
                              : "No date specified"}
                          </TableCell>
                          <TableCell>
                            {user?.role === "volunteer" ? (
                              <Badge
                                variant={getRegistrationStatusVariant(status)}
                              >
                                {formatRegistrationStatus(status)}
                              </Badge>
                            ) : (
                              <Badge
                                variant={
                                  (event.status || event.event?.status) ===
                                  "active"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {(
                                  event.status ||
                                  event.event?.status ||
                                  "active"
                                ).toUpperCase()}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-start gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="p-2 h-9 w-9 border border-gray-300 rounded-md flex items-center justify-center"
                                asChild
                              >
                                <Link
                                  to={
                                    user?.role === "volunteer"
                                      ? `/volunteer/events/${eventId}`
                                      : `/organizer/events/${eventId}`
                                  }
                                >
                                  <Eye className="h-5 w-5" />
                                </Link>
                              </Button>
                              {user?.role === "organiser" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="p-2 h-9 w-9 border border-gray-300 rounded-md flex items-center justify-center"
                                  asChild
                                >
                                  <Link to={`/events/edit/${eventId}`}>
                                    <PenSquare className="h-5 w-5" />
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                !fetchingEvents && (
                  <div className="text-center py-6 text-muted-foreground">
                    {user?.role === "volunteer"
                      ? "You haven't registered for any volunteer activities yet."
                      : "You haven't organized any events yet."}
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Profile;
