// src/components/EventVolunteersModal/index.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Api from "../../helpers/Api";

function EventVolunteersModal({ isOpen, onClose, eventId, eventName }) {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch when the modal is open
    if (isOpen && eventId) {
      fetchEventVolunteers();
    }
  }, [isOpen, eventId]);

  // Function to fetch volunteers for this event
  const fetchEventVolunteers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching volunteers for event: ${eventId}`);

      // Call the API
      const result = await Api.getEventVolunteers(eventId);

      console.log("Volunteers data received:", result);

      if (result && Array.isArray(result.registrations)) {
        setVolunteers(result.registrations);
        console.log(`Found ${result.registrations.length} volunteers`);
      } else {
        console.warn("No registrations array in response:", result);
        setVolunteers([]);
      }
    } catch (error) {
      console.error("Error in volunteer fetch:", error);
      setError("Failed to load volunteers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Handle volunteer check-in
  const handleCheckIn = async (registrationId) => {
    try {
      // Implement API call to update volunteer status
      console.log("Checking in volunteer:", registrationId);

      // Temporary check-in logic (replace with actual API call)
      const updatedVolunteers = volunteers.map((registration) =>
        registration._id === registrationId
          ? { ...registration, status: "attended" }
          : registration
      );

      setVolunteers(updatedVolunteers);
    } catch (error) {
      console.error("Error checking in volunteer:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl bg-white text-black p-6 rounded-lg shadow-xl"
        style={{
          backgroundColor: "white",
          color: "black",
          padding: "1.5rem",
          borderRadius: "0.5rem",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          zIndex: 1000, // Ensure it's above other elements
        }}
      >
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-semibold text-gray-800">
            Registered Volunteers - {eventName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="ml-2">Loading volunteers...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <p>{error}</p>
          </div>
        ) : volunteers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No volunteers have registered for this event yet.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Registered On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {volunteers.map((registration) => (
                  <TableRow key={registration._id}>
                    <TableCell className="font-medium">
                      {registration.volunteer_id?.name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      {registration.volunteer_id?.phone || "Not provided"}
                    </TableCell>
                    <TableCell>
                      {calculateAge(registration.volunteer_id?.dob)}
                    </TableCell>
                    <TableCell>
                      {new Date(
                        registration.registration_date
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          registration.status === "registered"
                            ? "outline"
                            : registration.status === "attended"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {registration.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={
                          registration.status === "attended"
                            ? "outline"
                            : "default"
                        }
                        disabled={registration.status === "attended"}
                        onClick={() => handleCheckIn(registration._id)}
                      >
                        {registration.status === "attended" ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" /> Checked In
                          </>
                        ) : (
                          "Check In"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default EventVolunteersModal;
