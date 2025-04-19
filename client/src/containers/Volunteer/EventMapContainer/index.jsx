import { useState, useEffect } from "react";
import { 
  MapPin, 
  ChevronLeft,
  Info,
  Compass,
  Home as HomeIcon
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import EventMapView from "../../../components/EventMapView";
import ContentHeader from "../../../components/ContentHeader";

const EventMapContainer = () => {
  const [apiKeyError, setApiKeyError] = useState(false);
  const [activeView, setActiveView] = useState("map");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if Google Maps API key is configured
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("Google Maps API key is not configured");
      setApiKeyError(true);
    }
  }, []);

  const handleBackClick = () => {
    navigate("/"); // Navigate back to home
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Button 
          variant="ghost" 
          onClick={handleBackClick} 
          className="mb-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Events
        </Button>
        
        <ContentHeader
          title="Find Volunteer Opportunities"
          links={[
            { to: "/", label: "Home" },
            { label: "Map View", isActive: true },
          ]}
        />
        
        <p className="text-gray-600 max-w-2xl mt-2">
          Discover volunteer opportunities near you. Use the map to explore events in your area or 
          filter by your preferences to find the perfect match for your volunteering goals.
        </p>
      </div>
      
      {apiKeyError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Google Maps API key is not configured. Please check your environment variables.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="map" value={activeView} onValueChange={setActiveView} className="mb-4">
        <TabsList className="grid grid-cols-2 w-[300px]">
          <TabsTrigger value="map" className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Map View
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center">
            <Compass className="h-4 w-4 mr-2" />
            List View
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-4">
          <TabsContent value="map" className="m-0">
            <p className="text-sm text-gray-500 mb-4 flex items-center">
              <Info className="h-4 w-4 mr-1" />
              Events are shown based on your current location. Click on markers or event cards to see details.
            </p>
            <div className="h-[calc(100vh-220px)] overflow-hidden rounded-lg border">
              <EventMapView />
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="m-0">
            <p className="text-sm text-gray-500 mb-4">
              The list view is currently being developed. Please use the map view to find events near you.
            </p>
            <div className="flex flex-col items-center justify-center h-[calc(100vh-220px)] border rounded-lg bg-gray-50">
              <div className="text-center p-8">
                <Compass className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">List View Coming Soon</h3>
                <p className="text-gray-500 max-w-md">
                  We're working on enhancing this feature to provide you with a streamlined list view of volunteer opportunities.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveView("map")}
                >
                  Switch to Map View
                </Button>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
      <div className="text-sm text-gray-500">
        <h3 className="font-semibold mb-2">About Event Map</h3>
        <p>
          The event map shows volunteer opportunities around your location. You can filter events by 
          distance, search for specific keywords, or browse by categories. Click on an event to view details 
          and sign up to volunteer.
        </p>
      </div>
    </div>
  );
};

export default EventMapContainer;