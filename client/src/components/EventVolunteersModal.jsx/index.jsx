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
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Search, FileDown } from "lucide-react";
import { useEffect, useState } from "react";
import Api from "../../helpers/Api";

function EventVolunteersModal({ isOpen, onClose, eventId, eventName }) {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    // Only fetch when the modal is open
    if (isOpen && eventId) {
      fetchEventVolunteers();
    }
  }, [isOpen, eventId]);

  // Filter volunteers whenever search query or volunteer list changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVolunteers(volunteers);
      return;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = volunteers.filter((registration) => {
      const volunteerName = safeGet(
        registration,
        "volunteer_id.name",
        ""
      ).toLowerCase();
      const volunteerPhone = safeGet(
        registration,
        "volunteer_id.phone",
        ""
      ).toLowerCase();

      return (
        volunteerName.includes(lowercaseQuery) ||
        volunteerPhone.includes(lowercaseQuery)
      );
    });

    setFilteredVolunteers(filtered);
  }, [searchQuery, volunteers]);

  // Function to fetch volunteers for this event
  const fetchEventVolunteers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching volunteers for event: ${eventId}`);

      // Call the API
      const result = await Api.getEventVolunteers(eventId);

      console.log("Volunteers data received:", result);

      // Enhanced error logging to debug response structure
      if (!result) {
        console.error("API returned null or undefined result");
        setVolunteers([]);
        setFilteredVolunteers([]);
        setError("Failed to load volunteers. Invalid response from server.");
        return;
      }

      // Check for different possible response formats
      if (Array.isArray(result)) {
        // Handle case where result is directly an array
        console.log("Response is an array, using directly");
        setVolunteers(result);
        setFilteredVolunteers(result);
      } else if (result.registrations && Array.isArray(result.registrations)) {
        // Handle standard format with registrations array
        console.log(
          `Found ${result.registrations.length} volunteers in registrations array`
        );
        setVolunteers(result.registrations);
        setFilteredVolunteers(result.registrations);
      } else if (result.data && Array.isArray(result.data)) {
        // Handle case where data might be in a data property
        console.log(`Found ${result.data.length} volunteers in data array`);
        setVolunteers(result.data);
        setFilteredVolunteers(result.data);
      } else {
        // If none of the expected formats match, try to extract any array
        const possibleArrays = Object.values(result).filter((val) =>
          Array.isArray(val)
        );
        if (possibleArrays.length > 0) {
          console.log(
            `Found array with ${possibleArrays[0].length} items in unexpected location`
          );
          setVolunteers(possibleArrays[0]);
          setFilteredVolunteers(possibleArrays[0]);
        } else {
          console.warn("No array found in response:", result);
          setVolunteers([]);
          setFilteredVolunteers([]);
        }
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

  // Helper function to safely access nested properties
  const safeGet = (obj, path, defaultValue = "Not provided") => {
    try {
      const parts = path.split(".");
      let current = obj;

      for (const part of parts) {
        if (current === null || current === undefined) {
          return defaultValue;
        }
        current = current[part];
      }

      return current === null || current === undefined ? defaultValue : current;
    } catch (e) {
      console.warn(`Error accessing path ${path}:`, e);
      return defaultValue;
    }
  };

  // Export volunteer data to CSV
  const exportToCSV = () => {
    try {
      setExporting(true);

      // CSV header
      const header = [
        "Name",
        "Phone",
        "Age",
        "Registration Date",
        "Status",
        "Check-in Status",
      ];

      // Transform volunteer data to CSV rows
      const csvRows = volunteers.map((registration) => [
        safeGet(registration, "volunteer_id.name"),
        safeGet(registration, "volunteer_id.phone"),
        calculateAge(safeGet(registration, "volunteer_id.dob", null)),
        registration.registration_date
          ? new Date(registration.registration_date).toLocaleDateString()
          : registration.signup_date
          ? new Date(registration.signup_date).toLocaleDateString()
          : "Unknown",
        registration.status || "registered",
        registration.status === "attended" ? "Checked In" : "Not Checked In",
      ]);

      // Add header to the beginning of rows
      const allRows = [header, ...csvRows];

      // Convert rows to CSV text (handle commas, quotes, etc.)
      const csvContent = allRows
        .map((row) =>
          row
            .map((cell) => {
              // Properly escape cells with commas, quotes, etc.
              const cellStr = String(cell);
              if (
                cellStr.includes(",") ||
                cellStr.includes('"') ||
                cellStr.includes("\n")
              ) {
                return `"${cellStr.replace(/"/g, '""')}"`;
              }
              return cellStr;
            })
            .join(",")
        )
        .join("\n");

      // Create a downloadable blob and trigger download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      // Create filename with event name and date
      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `${eventName.replace(
        /[^a-z0-9]/gi,
        "_"
      )}_Volunteers_${dateStr}.csv`;

      // Create a temporary link to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setExporting(false);
      }, 100);
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      alert("Failed to export volunteers to CSV. Please try again.");
      setExporting(false);
    }
  };

  // Handle volunteer check-in or check-out
  const handleAttendanceToggle = async (registration) => {
    setCheckingIn(true);
    try {
      // Check if already attended to determine if we're checking in or out
      const isCheckingOut = registration.status === "attended";
      console.log(
        isCheckingOut ? "Checking out volunteer:" : "Checking in volunteer:",
        registration._id
      );

      try {
        // Make the API call to check in/out volunteer
        const endpoint = isCheckingOut
          ? `${Api.SERVER_PREFIX}/registrations/${registration._id}/check-out`
          : `${Api.SERVER_PREFIX}/registrations/${registration._id}/check-in`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Update local state after successful API call
        setVolunteers(
          volunteers.map((vol) =>
            vol._id === registration._id
              ? {
                  ...vol,
                  status: isCheckingOut ? "registered" : "attended",
                  check_in_time: isCheckingOut ? null : new Date(),
                  check_out_time: isCheckingOut
                    ? new Date()
                    : vol.check_out_time,
                }
              : vol
          )
        );

        // Also update filtered volunteers to keep the UI in sync
        setFilteredVolunteers(
          filteredVolunteers.map((vol) =>
            vol._id === registration._id
              ? {
                  ...vol,
                  status: isCheckingOut ? "registered" : "attended",
                  check_in_time: isCheckingOut ? null : new Date(),
                  check_out_time: isCheckingOut
                    ? new Date()
                    : vol.check_out_time,
                }
              : vol
          )
        );
      } catch (apiError) {
        console.error(
          `API error when ${isCheckingOut ? "checking out" : "checking in"}:`,
          apiError
        );
        alert(
          `Failed to ${
            isCheckingOut ? "check out" : "check in"
          } volunteer. Please try again.`
        );
      }
    } catch (error) {
      console.error("Error toggling attendance:", error);
    } finally {
      setCheckingIn(false);
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

        {/* Search and Export Controls */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          {/* Search bar */}
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or phone"
              className="pl-10 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Export button */}
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={volunteers.length === 0 || loading || exporting}
            className="flex items-center gap-2"
          >
            {exporting ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full"></div>
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                Export to CSV
              </>
            )}
          </Button>
        </div>

        {searchQuery && filteredVolunteers.length > 0 && (
          <div className="mt-1 mb-3 text-sm text-gray-500">
            Found {filteredVolunteers.length} of {volunteers.length} volunteers
          </div>
        )}

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
        ) : filteredVolunteers.length === 0 && searchQuery ? (
          <div className="text-center py-8 text-gray-500">
            No volunteers match your search query "{searchQuery}".
            <button
              onClick={() => setSearchQuery("")}
              className="ml-2 text-primary hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Registered On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVolunteers.map((registration) => (
                  <TableRow key={registration._id || `reg-${Math.random()}`}>
                    <TableCell className="font-medium">
                      {safeGet(registration, "volunteer_id.name")}
                    </TableCell>
                    <TableCell>
                      {safeGet(registration, "volunteer_id.phone")}
                    </TableCell>
                    <TableCell>
                      {calculateAge(
                        safeGet(registration, "volunteer_id.dob", null)
                      )}
                    </TableCell>
                    <TableCell>
                      {registration.registration_date
                        ? new Date(
                            registration.registration_date
                          ).toLocaleDateString()
                        : registration.signup_date
                        ? new Date(
                            registration.signup_date
                          ).toLocaleDateString()
                        : "Unknown date"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          registration.status === "registered" ||
                          registration.status === "confirmed"
                            ? "outline"
                            : registration.status === "attended"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {registration.status || "registered"}
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
                        disabled={checkingIn}
                        onClick={() => handleAttendanceToggle(registration)}
                      >
                        {registration.status === "attended" ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" /> Undo Check
                            In
                          </>
                        ) : checkingIn ? (
                          <div className="flex items-center">
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full"></div>
                            Processing...
                          </div>
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
