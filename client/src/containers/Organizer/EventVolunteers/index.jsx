// src/containers/Organizer/EventVolunteers/index.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  UserX,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  FileDown,
  Search,
  Check,
} from "lucide-react";
import Api from "@/helpers/Api";
import ContentHeader from "@/components/ContentHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Add custom focus styles for search inputs
const customInputStyles = `
  .search-input:focus {
    border-width: 2px;
    border-color: rgb(59 130 246); /* Tailwind blue-500 */
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    outline: none;
  }
`;

const EventVolunteersPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [removalReason, setRemovalReason] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);
  const [eventName, setEventName] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [volunteersPerPage] = useState(15);

  useEffect(() => {
    if (eventId) {
      // Fetch event details to get the name
      fetchEventDetails();
      // Fetch volunteers list
      fetchVolunteers();
    }
  }, [eventId]);

  // Filter volunteers whenever the search query changes
  useEffect(() => {
    if (volunteers.length > 0) {
      filterVolunteers();
    }
  }, [searchQuery, volunteers]);

  const fetchEventDetails = async () => {
    try {
      const response = await Api.getEvent(eventId);
      if (response.ok) {
        const data = await response.json();
        setEventName(data.name || "Event");
      } else {
        setError("Failed to load event details");
      }
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError("Failed to load event details");
    }
  };

  const fetchVolunteers = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching volunteers for event ID: ${eventId}`);
      const data = await Api.getEventVolunteers(eventId);

      console.log("Received volunteer data:", data);
      if (data && data.registrations) {
        setVolunteers(data.registrations);
        setFilteredVolunteers(data.registrations);
      } else {
        console.warn("No registrations found in data:", data);
        setVolunteers([]);
        setFilteredVolunteers([]);
      }
    } catch (err) {
      console.error("Error fetching volunteers:", err);
      setError("Failed to load volunteer data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterVolunteers = () => {
    let filtered = volunteers;

    // Apply search filtering if there's a search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = volunteers.filter((registration) => {
        const volunteerName =
          registration.volunteer_data?.name?.toLowerCase() || "";
        const phone = registration.volunteer_data?.phone?.toLowerCase() || "";

        return volunteerName.includes(query) || phone.includes(query);
      });
    }

    // Store the total filtered results (needed for pagination)
    setFilteredVolunteers(filtered);
  };

  // Add a function to get current page items
  const getCurrentPageVolunteers = () => {
    const indexOfLastVolunteer = currentPage * volunteersPerPage;
    const indexOfFirstVolunteer = indexOfLastVolunteer - volunteersPerPage;
    return filteredVolunteers.slice(
      indexOfFirstVolunteer,
      indexOfLastVolunteer
    );
  };

  // Add a function to handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle check-in
  const handleCheckIn = async (registrationId) => {
    try {
      console.log(`Checking in volunteer with registration ${registrationId}`);

      const response = await Api.checkInRegistration(registrationId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to check in volunteer");
      }

      console.log("Volunteer checked in successfully");
      await fetchVolunteers();
    } catch (err) {
      console.error("Error checking in volunteer:", err);
      setError(
        "Failed to check in volunteer: " + (err.message || "Unknown error")
      );
    }
  };

  // Direct reset of check-in status
  const handleUndoCheckIn = async (registrationId) => {
    try {
      console.log(`Undoing check-in for registration ${registrationId}`);

      // Use the new direct reset method instead of checkOutRegistration
      const response = await Api.resetCheckInStatus(registrationId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to undo check-in");
      }

      console.log("Check-in status successfully reset");

      // Refresh the list after update
      await fetchVolunteers();
    } catch (err) {
      console.error("Error undoing check-in:", err);
      setError("Failed to undo check-in: " + (err.message || "Unknown error"));
    }
  };

  const handleRemoveClick = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setRemovalReason("");
    setShowRemoveDialog(true);
  };

  const confirmRemoveVolunteer = async () => {
    if (!selectedVolunteer) return;

    setIsRemoving(true);
    try {
      // Send the request to remove the volunteer
      const response = await Api.removeEventSignup(eventId, {
        registrationId: selectedVolunteer._id,
        reason: removalReason || "Removed by event organizer",
      });

      // Check if the request was successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove volunteer");
      }
      if (response.ok) {
        console.log("Volunteer removal successful");

        // Add a verification call to check the current registration count
        const verifyResponse = await Api.getEvent(eventId);
        const verifyData = await verifyResponse.json();
        console.log(
          "Verification after removal - registration count:",
          verifyData.registered_count
        );
      }

      setShowRemoveDialog(false);

      // Refresh the volunteers list
      await fetchVolunteers();
    } catch (err) {
      console.error("Error removing volunteer:", err);
      setError("Failed to remove volunteer");
    } finally {
      setIsRemoving(false);
    }
  };

  // CSV Export Function
  const exportToCSV = () => {
    if (!volunteers || volunteers.length === 0) {
      setError("No volunteer data to export");
      return;
    }

    try {
      setIsExporting(true);
      console.log("Starting CSV export process");

      // Define the header row - now includes a Checked In column
      const headers = [
        "Volunteer Name",
        "Status",
        "Contact Number",
        "Registration Date",
        "Checked In",
        "Check-in Time",
      ];

      // Format the data for CSV export
      const rows = volunteers.map((registration) => [
        registration.volunteer_data?.name || "N/A",
        // Status
        registration.status === "removed_by_organizer"
          ? "Removed"
          : registration.attendance_status === "attended"
          ? "Checked In"
          : registration.attendance_status === "no_show"
          ? "No Show"
          : "Registered",
        registration.volunteer_data?.phone || "N/A",
        new Date(registration.signup_date).toLocaleDateString(),
        // Checked in column (Yes/No) - now based on check_in_time
        registration.check_in_time ? "Yes" : "No",
        // Check-in time
        registration.check_in_time
          ? new Date(registration.check_in_time).toLocaleString()
          : "N/A",
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          // Handle commas and quotes in data
          row
            .map((cell) => {
              // If cell contains commas, quotes, or newlines, wrap in quotes
              if (
                cell &&
                (cell.includes(",") ||
                  cell.includes('"') ||
                  cell.includes("\n"))
              ) {
                // Replace double quotes with double double quotes
                return `"${cell.replace(/"/g, '""')}"`;
              }
              return cell;
            })
            .join(",")
        ),
      ].join("\n");

      // Create a blob with the CSV data
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

      // Create a URL for the blob
      const url = URL.createObjectURL(blob);

      // Create a link element to download the CSV
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${eventName.replace(/\s+/g, "_")}_Volunteers_${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      document.body.appendChild(link);

      // Click the link to download the file
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("CSV file exported successfully");
    } catch (err) {
      console.error("Error exporting data:", err);
      setError(
        "Failed to export volunteer data: " + (err.message || "Unknown error")
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Add style tag for custom search input styles */}
      <style>{customInputStyles}</style>

      <ContentHeader
        title={`Registered Volunteers - ${eventName}`}
      />

      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(`/organizer/events/${eventId}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Event
        </Button>

        <Button
          variant="outline"
          onClick={exportToCSV}
          className="flex items-center gap-2"
          disabled={volunteers.length === 0 || loading || isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Exporting...
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4 mr-2" /> Export to CSV
            </>
          )}
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Registered Volunteers</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or phone number..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 search-input transition-all duration-200"
            />
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>Loading volunteer data...</p>
            </div>
          ) : filteredVolunteers.length === 0 ? (
            <div className="py-20 text-center">
              {searchQuery ? (
                <p className="text-gray-500">
                  No volunteers match your search criteria.
                </p>
              ) : (
                <p className="text-gray-500">
                  No volunteers have registered for this event yet.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Volunteer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead className="text-center">Checked In</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getCurrentPageVolunteers().map((registration) => (
                    <TableRow key={registration._id}>
                      {/* Simplified volunteer cell with just the name */}
                      <TableCell className="font-medium">
                        <span>
                          {registration.volunteer_data?.name || "Volunteer"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {registration.status === "removed_by_organizer" ? (
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200"
                          >
                            Removed
                          </Badge>
                        ) : registration.attendance_status === "attended" ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            Checked In
                          </Badge>
                        ) : registration.attendance_status === "no_show" ? (
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-200"
                          >
                            No Show
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            Registered
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {registration.volunteer_data?.phone || "N/A"}
                      </TableCell>
                      <TableCell>
                        {new Date(
                          registration.signup_date
                        ).toLocaleDateString()}
                      </TableCell>
                      {/* Checked In column with tick mark */}
                      <TableCell className="text-center">
                        {registration.check_in_time ? (
                          <div className="flex justify-center">
                            <div className="bg-green-100 p-1 rounded-full">
                              <Check className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {/* Only show action buttons for registrations that aren't removed */}
                          {registration.status !== "removed_by_organizer" && (
                            <>
                              {/* Conditionally show either Check In or Undo button */}
                              {registration.check_in_time ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleUndoCheckIn(registration._id)
                                  }
                                  title="Remove check-in"
                                  className="text-red-500 hover:bg-red-50"
                                >
                                  <div className="flex items-center">
                                    <XCircle className="h-4 w-4 mr-1" />
                                    <span className="text-xs">Undo</span>
                                  </div>
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleCheckIn(registration._id)
                                  }
                                  title="Check in volunteer"
                                  className="text-green-500 hover:bg-green-50"
                                >
                                  <div className="flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    <span className="text-xs">Check In</span>
                                  </div>
                                </Button>
                              )}

                              {/* Remove button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveClick(registration)}
                                className="text-red-500 hover:bg-red-50"
                                title="Remove volunteer"
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Volunteer Dialog */}
      {selectedVolunteer && (
        <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Remove Volunteer
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <p className="mb-4">
                Are you sure you want to remove{" "}
                <strong>{selectedVolunteer.volunteer_data?.name}</strong> from
                this this event?
              </p>
              <p className="mb-2 text-sm text-gray-600">
                The volunteer will be notified and{" "}
                <strong>won't be able to sign up for this event again</strong>.
              </p>

              <div className="mt-4">
                <label
                  htmlFor="removalReason"
                  className="block text-sm font-medium mb-1"
                >
                  Reason for removal (optional):
                </label>
                <Textarea
                  id="removalReason"
                  placeholder="Provide a reason for removing this volunteer..."
                  value={removalReason}
                  onChange={(e) => setRemovalReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRemoveDialog(false)}
                disabled={isRemoving}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={confirmRemoveVolunteer}
                disabled={isRemoving}
                className="bg-red-500 hover:bg-red-600 text-white hover:text-white"
              >
                {isRemoving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Remove Volunteer"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Pagination Component */}
      <div className="mt-4 flex justify-center gap-2">
        {/* Only show Previous if not on first page and there's more than one page */}
        {currentPage > 1 && (
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>
        )}

        <div className="flex items-center gap-1">
          {Array.from({
            length: Math.max(
              1,
              Math.ceil(filteredVolunteers.length / volunteersPerPage)
            ),
          }).map((_, index) => {
            const pageNumber = index + 1;
            // Show only a limited number of pages
            if (
              pageNumber === 1 ||
              pageNumber ===
                Math.ceil(filteredVolunteers.length / volunteersPerPage) ||
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber)}
                  className="min-w-[40px]"
                >
                  {pageNumber}
                </Button>
              );
            } else if (
              (pageNumber === currentPage - 2 && pageNumber > 1) ||
              (pageNumber === currentPage + 2 &&
                pageNumber <
                  Math.ceil(filteredVolunteers.length / volunteersPerPage))
            ) {
              return (
                <span key={pageNumber} className="px-2">
                  ...
                </span>
              );
            }
            return null;
          })}
        </div>

        {/* Only show Next if not on last page and there's more than one page */}
        {currentPage <
          Math.ceil(filteredVolunteers.length / volunteersPerPage) && (
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        )}
      </div>

      {/* Add a text showing the page information */}
      <div className="mt-2 text-center text-sm text-gray-500">
        Page {currentPage} of{" "}
        {Math.max(1, Math.ceil(filteredVolunteers.length / volunteersPerPage))}
        {filteredVolunteers.length > 0 && (
          <span>
            {" "}
            • Showing{" "}
            {Math.min(
              volunteersPerPage,
              filteredVolunteers.length - (currentPage - 1) * volunteersPerPage
            )}
            of {filteredVolunteers.length} volunteers
          </span>
        )}
      </div>
    </div>
  );
};

export default EventVolunteersPage;
