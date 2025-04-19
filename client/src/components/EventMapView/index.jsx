import { useState, useEffect, useRef } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  MapControl,
  ControlPosition
} from "@vis.gl/react-google-maps";
import {
  Search,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Users
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Api from "../../helpers/Api";

// Custom marker component for better styling
const EventMarker = ({ event, isSelected, onClick }) => {
  return (
    <div
      className={`relative cursor-pointer transition-all duration-200 ${isSelected ? 'scale-125 z-10' : 'z-0'}`}
      onClick={onClick}
    >
      <MapPin
        className={`h-8 w-8 ${isSelected ? 'text-primary-600' : 'text-primary'} drop-shadow-md`}
        fill={isSelected ? "rgba(79, 70, 229, 0.2)" : "rgba(79, 70, 229, 0.1)"}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white -mt-1">{event.registered_count || 0}</span>
      </div>
    </div>
  );
};

const EventMapView = () => {
  const mapRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 1.3521, lng: 103.8198 }); // Default to Singapore
  const [mapCenter, setMapCenter] = useState({ lat: 1.3521, lng: 103.8198 });
  const [searchRadius, setSearchRadius] = useState(10); // Radius in km
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Load events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await Api.getAllEvents();

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();
        console.log("Fetched events:", data);

        // Make sure we're working with an array of events
        const eventsArray = Array.isArray(data) ? data :
          (data.events && Array.isArray(data.events)) ? data.events : [];

        console.log("Events array:", eventsArray);

        // Extract all unique categories from events
        const allCategories = eventsArray.reduce((cats, event) => {
          if (event.causes && Array.isArray(event.causes)) {
            event.causes.forEach(cause => {
              if (!cats.includes(cause)) {
                cats.push(cause);
              }
            });
          }
          return cats;
        }, []);

        setCategories(allCategories);
        // Process events to ensure they have coordinates
        const processedEvents = eventsArray.map(event => {
          console.log(event)
          // If event doesn't have coordinates but has location, we could geocode here
          // For now, we'll use random coordinates near Singapore for demo
          if (!event.coordinates) {
            const lat = event.latitude;
            const lng = event.longitude
            return { ...event, coordinates: { lat, lng } };
          }
          return event;
        });

        setEvents(processedEvents);
        setFilteredEvents(processedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          setMapCenter(userPos);
        },
        (error) => {
          console.warn("Error getting location:", error);
          // Keep default location
        }
      );
    }

    fetchEvents();
  }, []);

  // Filter events when search query, radius, or categories change
  useEffect(() => {
    if (events.length === 0) return;

    // Filter based on search query, distance, and categories
    const filtered = events.filter(event => {
      // Filter by search query
      const matchesQuery = searchQuery === "" ||
        (event.name && event.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filter by distance
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        event.latitude,
        event.longitude,
      );
      const withinRadius = distance <= searchRadius;

      // Filter by categories
      const matchesCategories = selectedCategories.length === 0 ||
        (event.causes && event.causes.some(cat => selectedCategories.includes(cat)));

      return matchesQuery && withinRadius && matchesCategories;
    });

    setFilteredEvents(filtered);
  }, [searchQuery, searchRadius, selectedCategories, events, userLocation]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const handleMarkerClick = (event) => {
    setSelectedEvent(event);
    setInfoWindowOpen(true);
    setMapCenter(event.coordinates);
  };

  const handleListItemClick = (event) => {
    setSelectedEvent(event);
    setInfoWindowOpen(true);
    setMapCenter(event.coordinates);

    // Smooth scroll to bring clicked item into view on mobile
    if (window.innerWidth < 768) {
      document.getElementById(`event-list-item-${event._id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  const handleInfoWindowClose = () => {
    setInfoWindowOpen(false);
  };

  const handleRadiusChange = (value) => {
    setSearchRadius(value[0]);
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSearchRadius(10);
    setSelectedCategories([]);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD";
    return new Date(dateString).toLocaleDateString();
  };

  // Navigate to event detail
  const navigateToEvent = (eventId) => {
    window.location.href = `/events/${eventId}`;
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left sidebar with event list */}
      <div className="w-full md:w-1/3 h-1/2 md:h-screen overflow-y-auto border-r">
        <div className="sticky top-0 bg-white z-10 p-4 border-b">
          <h2 className="text-2xl font-bold mb-4">Events Near You</h2>
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search events..."
              className="pl-10 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters toggle */}
          <div className="mb-2">
            <Button
              variant="outline"
              className="w-full flex justify-between items-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <div className="flex items-center">
                <Filter size={16} className="mr-2" />
                <span>Filters</span>
              </div>
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="p-4 bg-gray-50 rounded-md mb-4 animate-in slide-in-from-top duration-300">
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <Label className="text-sm font-medium">Distance (km): {searchRadius}</Label>
                  <span className="text-sm text-gray-500">{searchRadius} km</span>
                </div>
                <Slider
                  defaultValue={[searchRadius]}
                  max={50}
                  min={1}
                  step={1}
                  onValueChange={handleRadiusChange}
                />
              </div>

              {categories.length > 0 && (
                <div className="mb-4">
                  <Label className="text-sm font-medium block mb-2">Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        />
                        <label
                          htmlFor={`category-${category}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full mt-2">
                <X size={14} className="mr-1" /> Clear Filters
              </Button>
            </div>
          )}

          {/* Results count */}
          <div className="text-sm text-gray-500 mb-2">
            Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
            {searchRadius ? ` within ${searchRadius}km` : ''}
          </div>
        </div>

        {/* Event list */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="m-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            No events found matching your criteria
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {filteredEvents.map(event => (
              <Card
                key={event._id}
                id={`event-list-item-${event._id}`}
                className={`cursor-pointer transition-all hover:shadow-md ${selectedEvent && selectedEvent._id === event._id ? 'ring-2 ring-primary' : ''
                  }`}
                onClick={() => handleListItemClick(event)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{event.name}</h3>
                    <Badge className={
                      event.status === "active" ? "bg-green-100 text-green-800" :
                        event.status === "completed" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                    }>
                      {event.status?.toUpperCase() || "ACTIVE"}
                    </Badge>
                  </div>

                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <MapPin size={14} className="mr-1" />
                    <span className="truncate">{event.location}</span>
                  </div>

                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <Calendar size={14} className="mr-1" />
                    <span>
                      {formatDate(event.start_datetime || event.start_date || event.recurrence_start_date)}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-500 text-sm">
                    <Users size={14} className="mr-1" />
                    <span>
                      {event.registered_count || 0}/{event.max_volunteers || "∞"} volunteers
                    </span>
                  </div>

                  {event.causes && event.causes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {event.causes.map(cause => (
                        <Badge
                          key={cause}
                          variant="outline"
                          className="text-xs"
                        >
                          {cause}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Right side map */}
      <div className="w-full md:w-2/3 h-1/2 md:h-screen relative">
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
          <Map
            defaultZoom={14}
            center={mapCenter}
            mapId={"d0eff4764a055a98"}
            tilt={0}
            streetViewControl={false}
            fullscreenControl={false}
            mapTypeControl={false}
            zoomControl={true}
            mapTypeId={'roadmap'}
            disableDefaultUI={true}
            minZoom={10}
            maxZoom={20}
            gestureHandling="cooperative"
            className="w-full h-full"
            onLoad={(map) => {
              // Store map instance in ref when it loads
              if (mapRef.current !== map) {
                mapRef.current = map;
              }
            }}
          >
            {/* Event markers */}
            {filteredEvents.map(event => (
              <AdvancedMarker
                key={event._id}
                position={event.coordinates}
              >
                <EventMarker
                  event={event}
                  isSelected={selectedEvent && selectedEvent._id === event._id}
                  onClick={() => handleMarkerClick(event)}
                />
              </AdvancedMarker>
            ))}
            <AdvancedMarker position={userLocation}>
              <div className="h-4 w-4 bg-blue-500 rounded-full border-2 border-white shadow-md" />
            </AdvancedMarker>
            {/* Info window for selected event */}
            {selectedEvent && infoWindowOpen && (
              <InfoWindow
                position={selectedEvent.coordinates}
                onCloseClick={handleInfoWindowClose}
              >
                <div className="max-w-xs">
                  <h3 className="font-bold mb-1">{selectedEvent.name}</h3>
                  <p className="text-sm mb-2 text-gray-600 line-clamp-2">{selectedEvent.description}</p>
                  <div className="text-sm mb-1"><strong>Location:</strong> {selectedEvent.location}</div>
                  <div className="text-sm mb-1">
                    <strong>Date:</strong> {formatDate(selectedEvent.start_datetime || selectedEvent.start_date || selectedEvent.recurrence_start_date)}
                  </div>
                  <div className="text-sm mb-2">
                    <strong>Volunteers:</strong> {selectedEvent.registered_count || 0}/{selectedEvent.max_volunteers || "∞"}
                  </div>
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => navigateToEvent(selectedEvent._id)}
                  >
                    View Details
                  </Button>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>
    </div>
  );
};

export default EventMapView;