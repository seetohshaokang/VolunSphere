// src/components/EventVolunteersModal.jsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  UserX,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import Api from "@/helpers/Api";

const EventVolunteersModal = ({ isOpen, onClose, eventId, eventName }) => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [removalReason, setRemovalReason] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (isOpen && eventId) {
      fetchVolunteers();
    }
  }, [isOpen, eventId]);

  const fetchVolunteers = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching volunteers for event ID: ${eventId}`);
      const data = await Api.getEventVolunteers(eventId);

      console.log("Received volunteer data:", data);
      if (data && data.registrations) {
        setVolunteers(data.registrations);
      } else {
        console.warn("No registrations found in data:", data);
        setVolunteers([]);
      }
    } catch (err) {
      console.error("Error fetching volunteers:", err);
      setError("Failed to load volunteer data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAttendance = async (registrationId, currentStatus) => {
    try {
      await Api.toggleRegistrationStatus(registrationId, currentStatus);
      fetchVolunteers(); // Refresh the list after update
    } catch (err) {
      console.error("Error updating attendance status:", err);
      setError("Failed to update attendance status");
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
      await Api.removeEventSignup(eventId, {
        registrationId: selectedVolunteer._id,
        reason: removalReason || "Removed by event organizer",
      });

      setShowRemoveDialog(false);
      fetchVolunteers(); // Refresh the list
    } catch (err) {
      console.error("Error removing volunteer:", err);
      setError("Failed to remove volunteer");
    } finally {
      setIsRemoving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Registered Volunteers - {eventName}</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Loading volunteer data...</p>
          </div>
        ) : volunteers.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-500">
              No volunteers have registered for this event yet.
            </p>
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {volunteers.map((registration) => (
                  <TableRow key={registration._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage
                            src={
                              registration.volunteer_id?.profile_picture_url ||
                              ""
                            }
                            alt={registration.volunteer_id?.name || "Volunteer"}
                          />
                          <AvatarFallback>
                            {getInitials(registration.volunteer_id?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {registration.volunteer_id?.name || "Volunteer"}
                        </span>
                      </div>
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
                          Attended
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
                      {registration.volunteer_id?.phone || "N/A"}
                    </TableCell>
                    <TableCell>
                      {new Date(registration.signup_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {/* Only show attendance toggle for registrations that aren't removed */}
                        {registration.status !== "removed_by_organizer" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleAttendance(
                                registration._id,
                                registration.attendance_status
                              )
                            }
                            title={
                              registration.attendance_status === "attended"
                                ? "Mark as not attended"
                                : "Mark as attended"
                            }
                          >
                            {registration.attendance_status === "attended" ? (
                              <XCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                        )}

                        {/* Only show remove button for registrations that aren't already removed */}
                        {registration.status !== "removed_by_organizer" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveClick(registration)}
                            className="text-red-500 hover:bg-red-50"
                            title="Remove volunteer"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>

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
                <strong>{selectedVolunteer.volunteer_id?.name}</strong> from
                this event?
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
                variant="destructive"
                onClick={confirmRemoveVolunteer}
                disabled={isRemoving}
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
    </Dialog>
  );
};

export default EventVolunteersModal;
