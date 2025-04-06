// src/containers/Organizer/Dashboard/index.jsx
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ContentHeader from "../../../components/ContentHeader";
import { useAuth } from "../../../contexts/AuthContext";
import Api from "../../../helpers/Api";

function OrganizerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const fetchOrganizedEvents = async () => {
      try {
        setLoading(true);
        const response = await Api.getOrganizedEvents();

        // Check if response is OK
        if (!response.ok) {
          // Handle different error status codes
          if (response.status === 401) {
            console.error(
              "Authentication error: Token may be invalid or expired"
            );
            setAuthError(true);
            return;
          }

          throw new Error(`API error: ${response.status}`);
        }

        // Parse the response data
        const data = await response.json();
        console.log("Fetched events:", data);

        // Ensure events is an array (handle different API response formats)
        let eventsList = [];
        if (Array.isArray(data)) {
          eventsList = data;
        } else if (data.events && Array.isArray(data.events)) {
          eventsList = data.events;
        } else if (typeof data === "object") {
          // If it's some other object structure, initialize as empty array
          console.warn("Unexpected API response format:", data);
          eventsList = [];
        }

        setEvents(eventsList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching organized events:", err);
        setError("Failed to load your events. Please try again.");
        setLoading(false);
        setEvents([]); // Initialize as empty array on error
      }
    };

    fetchOrganizedEvents();
  }, []);

  // Function to handle card click
  const handleCardClick = (eventId) => {
    navigate(`/organizer/events/${eventId}`);
  };

  // If auth error, show a message with login button
  if (authError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <ContentHeader
          title="Authentication Error"
          links={[
            { to: "/", label: "Home" },
            { label: "Dashboard", isActive: true },
          ]}
        />

        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Your session has expired or you don't have permission to view this
            page.
          </AlertDescription>
        </Alert>

        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate("/")}>
            Go to Home
          </Button>
          <Button
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Log in Again
          </Button>
        </div>
      </div>
    );
  }

  // Calculate total volunteers with defensive check
  const totalVolunteers = Array.isArray(events)
    ? events.reduce((acc, event) => acc + (event.registered_count || 0), 0)
    : 0;

  // Calculate active events with defensive check
  const activeEvents = Array.isArray(events)
    ? events.filter((e) => e.status === "active").length
    : 0;

  return (
    <div className="container mx-auto px-4 py-6">
      <ContentHeader
        title="Organizer Dashboard"
        links={[
          { to: "/", label: "Home" },
          { label: "Dashboard", isActive: true },
        ]}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          Welcome back, {user?.name || "Organizer"}
        </h2>
        <Button onClick={() => navigate("/events/create")}>
          <Plus className="h-4 w-4 mr-2" /> Create New Event
        </Button>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Events</p>
              <h3 className="text-2xl font-bold">
                {Array.isArray(events) ? events.length : 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Volunteers</p>
              <h3 className="text-2xl font-bold">{totalVolunteers}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upcoming Events</p>
              <h3 className="text-2xl font-bold">{activeEvents}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-6">{error}</div>
          ) : !Array.isArray(events) || events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                You haven't created any events yet.
              </p>
              <Button onClick={() => navigate("/events/create")}>
                <Plus className="h-4 w-4 mr-2" /> Create Your First Event
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event._id || event.id}
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleCardClick(event._id || event.id)}
                >
                  <div className="relative">
                    <img
                      src={event.image_url || "/src/assets/default-event.jpg"}
                      alt={event.name}
                      className="h-40 w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/src/assets/default-event.jpg";
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-medium">
                      {event.status === "active" ? (
                        <span className="text-green-600">Active</span>
                      ) : event.status === "completed" ? (
                        <span className="text-gray-600">Completed</span>
                      ) : (
                        <span className="text-yellow-600">{event.status}</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{event.name}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {/* Display date for recurring and non-recurring events */}
                      {event.is_recurring && event.recurrence_start_date
                        ? new Date(
                            event.recurrence_start_date
                          ).toLocaleDateString()
                        : event.start_datetime
                        ? new Date(event.start_datetime).toLocaleDateString()
                        : event.start_date
                        ? new Date(event.start_date).toLocaleDateString()
                        : "Date TBD"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {event.location || "Location not specified"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Users className="h-4 w-4 mr-1" />
                      {event.registered_count || 0} /{" "}
                      {event.max_volunteers || 0} volunteers
                    </div>
                    <div
                      className="block w-full bg-primary text-white text-center py-2 rounded-md hover:bg-primary/90 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the card click
                        navigate(`/organizer/events/${event._id || event.id}`);
                      }}
                    >
                      Manage Event
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default OrganizerDashboard;
