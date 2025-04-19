import ContentHeader from "@/components/ContentHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import Api from "@/helpers/Api";
import {
	AlertTriangle,
	ArrowLeft,
	Check,
	CheckCircle,
	FileDown,
	Flag,
	Loader2,
	Search,
	UserX,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

//custom styles
const customInputStyles = `
  .search-input:focus, .custom-textarea:focus {
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
	const [showReportModal, setShowReportModal] = useState(false);
	const [reportReason, setReportReason] = useState("");
	const [reportDetails, setReportDetails] = useState("");
	const [isReporting, setIsReporting] = useState(false);
	const [volunteerToReport, setVolunteerToReport] = useState(null);
	const [successMessage, setSuccessMessage] = useState(null);
	const [selectedVolunteerForProfile, setSelectedVolunteerForProfile] =
		useState(null);
	const [showVolunteerProfileModal, setShowVolunteerProfileModal] =
		useState(false);

	useEffect(() => {
		if (eventId) {
			fetchEventDetails();
			fetchVolunteers();
		}
	}, [eventId]);

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

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			filtered = volunteers.filter((registration) => {
				const volunteerName =
					registration.volunteer_data?.name?.toLowerCase() || "";
				const phone =
					registration.volunteer_data?.phone?.toLowerCase() || "";

				return volunteerName.includes(query) || phone.includes(query);
			});
		}

		setFilteredVolunteers(filtered);
	};

	const getCurrentPageVolunteers = () => {
		const indexOfLastVolunteer = currentPage * volunteersPerPage;
		const indexOfFirstVolunteer = indexOfLastVolunteer - volunteersPerPage;
		return filteredVolunteers.slice(
			indexOfFirstVolunteer,
			indexOfLastVolunteer
		);
	};

	const handlePageChange = (page) => {
		setCurrentPage(page);
	};

	const handleCheckIn = async (registrationId) => {
		try {
			console.log(
				`Checking in volunteer with registration ${registrationId}`
			);

			const response = await Api.checkInRegistration(registrationId);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to check in volunteer"
				);
			}

			console.log("Volunteer checked in successfully");
			await fetchVolunteers();
		} catch (err) {
			console.error("Error checking in volunteer:", err);
			setError(
				"Failed to check in volunteer: " +
					(err.message || "Unknown error")
			);
		}
	};

	const handleUndoCheckIn = async (registrationId) => {
		try {
			console.log(`Undoing check-in for registration ${registrationId}`);

			const response = await Api.resetCheckInStatus(registrationId);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to undo check-in");
			}

			console.log("Check-in status successfully reset");

			await fetchVolunteers();
		} catch (err) {
			console.error("Error undoing check-in:", err);
			setError(
				"Failed to undo check-in: " + (err.message || "Unknown error")
			);
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
			const response = await Api.removeEventSignup(eventId, {
				registrationId: selectedVolunteer._id,
				reason: removalReason || "Removed by event organizer",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to remove volunteer"
				);
			}
			if (response.ok) {
				console.log("Volunteer removal successful");

				const verifyResponse = await Api.getEvent(eventId);
				const verifyData = await verifyResponse.json();
				console.log(
					"Verification after removal - registration count:",
					verifyData.registered_count
				);
			}

			setShowRemoveDialog(false);

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

			const headers = [
				"Volunteer Name",
				"Status",
				"Contact Number",
				"Registration Date",
				"Checked In",
				"Check-in Time",
			];

			const rows = volunteers.map((registration) => [
				registration.volunteer_data?.name || "N/A",
				registration.status === "removed_by_organizer"
					? "Removed"
					: registration.attendance_status === "attended"
					? "Checked In"
					: registration.attendance_status === "no_show"
					? "No Show"
					: "Registered",
				registration.volunteer_data?.phone || "N/A",
				new Date(registration.signup_date).toLocaleDateString(),
				registration.check_in_time ? "Yes" : "No",
				registration.check_in_time
					? new Date(registration.check_in_time).toLocaleString()
					: "N/A",
			]);

			// Create CSV content
			const csvContent = [
				headers.join(","),
				...rows.map((row) =>
					row
						.map((cell) => {
							if (
								cell &&
								(cell.includes(",") ||
									cell.includes('"') ||
									cell.includes("\n"))
							) {
								return `"${cell.replace(/"/g, '""')}"`;
							}
							return cell;
						})
						.join(",")
				),
			].join("\n");

			const blob = new Blob([csvContent], {
				type: "text/csv;charset=utf-8;",
			});

			const url = URL.createObjectURL(blob);

			const link = document.createElement("a");
			link.href = url;
			link.setAttribute(
				"download",
				`${eventName.replace(/\s+/g, "_")}_Volunteers_${
					new Date().toISOString().split("T")[0]
				}.csv`
			);
			document.body.appendChild(link);

			link.click();

			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			console.log("CSV file exported successfully");
		} catch (err) {
			console.error("Error exporting data:", err);
			setError(
				"Failed to export volunteer data: " +
					(err.message || "Unknown error")
			);
		} finally {
			setIsExporting(false);
		}
	};

	const handleSearchChange = (e) => {
		setSearchQuery(e.target.value);
	};

	const handleReportClick = (volunteer) => {
		setVolunteerToReport(volunteer);
		setReportReason("");
		setReportDetails("");
		setShowReportModal(true);
	};

	const submitReport = async () => {
		if (!reportReason) {
			setError("Please provide a reason for reporting this volunteer.");
			return;
		}

		setIsReporting(true);

		try {
			const volunteerId =
				volunteerToReport.volunteer_data?.user_id ||
				volunteerToReport.volunteer_data?._id;

			if (!volunteerId) {
				console.error(
					"Could not determine volunteer ID",
					volunteerToReport
				);
				setError(
					"Could not identify volunteer. Please try again later."
				);
				setIsReporting(false);
				return;
			}

			console.log("Reporting volunteer:", {
				reported_type: "Volunteer",
				reported_id: volunteerId,
				event_id: eventId,
				reason: reportReason,
				details: reportDetails || "",
			});

			const response = await fetch(`${Api.SERVER_PREFIX}/reports`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({
					reported_type: "Volunteer",
					reported_id: volunteerId,
					event_id: eventId,
					reason: reportReason,
					details: reportDetails || "",
				}),
			});

			const data = await response.json();

			if (response.ok) {
				toast.success(
					"Volunteer reported successfully. Our team will review your report."
				);
				setSuccessMessage(
					"Volunteer reported successfully. Our team will review your report."
				);
				setShowReportModal(false);
				setReportReason("");
				setReportDetails("");

				setTimeout(() => {
					setSuccessMessage(null);
				}, 3000);
			} else {
				console.error("Error response:", data);
				toast.error(
					data.message || "Failed to submit report. Please try again"
				);
				setError(
					data.message || "Failed to submit report. Please try again."
				);
			}
		} catch (error) {
			console.error("Error reporting volunteer:", error);
			toast.error("An unexpected error occurred. Please try again.");
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setIsReporting(false);
		}
	};

	const handleViewVolunteerProfile = (registration) => {
		if (!registration) {
			toast.error("Cannot view profile: Registration data is missing");
			setError("Cannot view profile: Registration data is missing");
			return;
		}

		console.log(
			"Showing volunteer profile - detailed data:",
			JSON.stringify(registration, null, 2)
		);
		setSelectedVolunteerForProfile(registration);
		setShowVolunteerProfileModal(true);
	};

	return (
		<div className="container mx-auto p-4 md:p-6">
			<style>{customInputStyles}</style>

			<ContentHeader title={`Registered Volunteers - ${eventName}`} />

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
									No volunteers have registered for this event
									yet.
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
										<TableHead className="text-center">
											Checked In
										</TableHead>
										<TableHead className="text-right">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{getCurrentPageVolunteers().map(
										(registration) => (
											<TableRow key={registration._id}>
												{/* Simplified volunteer cell */}
												<TableCell className="font-medium">
													<button
														onClick={() =>
															handleViewVolunteerProfile(
																registration
															)
														}
														className="text-blue-600 hover:text-blue-800 hover:underline text-left cursor-pointer font-medium"
														type="button"
													>
														{registration
															.volunteer_data
															?.name ||
															"Volunteer"}
													</button>
												</TableCell>
												<TableCell>
													{registration.status ===
													"removed_by_organizer" ? (
														<Badge
															variant="outline"
															className="bg-red-50 text-red-700 border-red-200"
														>
															Removed
														</Badge>
													) : registration.attendance_status ===
													  "attended" ? (
														<Badge
															variant="outline"
															className="bg-green-50 text-green-700 border-green-200"
														>
															Checked In
														</Badge>
													) : registration.attendance_status ===
													  "no_show" ? (
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
													{registration.volunteer_data
														?.phone || "N/A"}
												</TableCell>
												<TableCell>
													{new Date(
														registration.signup_date
													).toLocaleDateString()}
												</TableCell>
												{/* Checked In column */}
												<TableCell className="text-center">
													{registration.check_in_time ? (
														<div className="flex justify-center">
															<div className="bg-green-100 p-1 rounded-full">
																<Check className="h-4 w-4 text-green-600" />
															</div>
														</div>
													) : (
														<span className="text-gray-400">
															-
														</span>
													)}
												</TableCell>
												<TableCell className="text-right">
													<div className="flex justify-end space-x-2">
														{/* Only show action buttons for registrations that aren't removed */}
														{registration.status !==
															"removed_by_organizer" && (
															<>
																{registration.check_in_time ? (
																	<Button
																		variant="outline"
																		size="sm"
																		onClick={() =>
																			handleUndoCheckIn(
																				registration._id
																			)
																		}
																		title="Remove check-in"
																		className="text-red-500 hover:bg-red-50"
																	>
																		<div className="flex items-center">
																			<XCircle className="h-4 w-4 mr-1" />
																			<span className="text-xs">
																				Undo
																			</span>
																		</div>
																	</Button>
																) : (
																	<Button
																		variant="outline"
																		size="sm"
																		onClick={() =>
																			handleCheckIn(
																				registration._id
																			)
																		}
																		title="Check in volunteer"
																		className="text-green-500 hover:bg-green-50"
																	>
																		<div className="flex items-center">
																			<CheckCircle className="h-4 w-4 mr-1" />
																			<span className="text-xs">
																				Check
																				In
																			</span>
																		</div>
																	</Button>
																)}

																<Button
																	variant="outline"
																	size="sm"
																	onClick={() =>
																		handleRemoveClick(
																			registration
																		)
																	}
																	className="text-red-500 hover:bg-red-50"
																	title="Remove volunteer"
																>
																	<UserX className="h-4 w-4" />
																</Button>

																<Button
																	variant="outline"
																	size="sm"
																	onClick={() =>
																		handleReportClick(
																			registration
																		)
																	}
																	className="text-red-500 hover:bg-red-50"
																	title="Report volunteer"
																>
																	<Flag className="h-4 w-4" />
																</Button>
															</>
														)}
													</div>
												</TableCell>
											</TableRow>
										)
									)}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Remove Volunteer Dialog */}
			{selectedVolunteer && (
				<Dialog
					open={showRemoveDialog}
					onOpenChange={setShowRemoveDialog}
				>
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
								<strong>
									{selectedVolunteer.volunteer_data?.name}
								</strong>{" "}
								from this this event?
							</p>
							<p className="mb-2 text-sm text-gray-600">
								The volunteer will be notified and{" "}
								<strong>
									won't be able to sign up for this event
									again
								</strong>
								.
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
									onChange={(e) =>
										setRemovalReason(e.target.value)
									}
									rows={3}
									className="custom-textarea"
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

			{/* Report Volunteer Modal */}
			{volunteerToReport && (
				<Dialog
					open={showReportModal}
					onOpenChange={(open) => {
						if (!open) {
							setShowReportModal(false);
							setError(null);
						}
					}}
				>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle className="flex items-center">
								<Flag className="h-5 w-5 text-red-500 mr-2" />
								Report Volunteer
							</DialogTitle>
							<DialogDescription>
								Report{" "}
								{volunteerToReport.volunteer_data?.name ||
									"volunteer"}{" "}
								for inappropriate behavior or policy violations.
								Our admin team will review your report and take
								appropriate action.
							</DialogDescription>
						</DialogHeader>

						<div className="py-4">
							<div className="mb-4">
								<label
									htmlFor="reportReason"
									className="block text-sm font-medium mb-1"
								>
									Reason for reporting *
								</label>
								<select
									id="reportReason"
									value={reportReason}
									onChange={(e) =>
										setReportReason(e.target.value)
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									required
								>
									<option value="">Select a reason</option>
									<option value="No-show without notification">
										No-show without notification
									</option>
									<option value="Inappropriate behavior">
										Inappropriate behavior
									</option>
									<option value="Violation of event rules">
										Violation of event rules
									</option>
									<option value="Misrepresentation of skills">
										Misrepresentation of skills
									</option>
									<option value="Other">Other</option>
								</select>
							</div>

							<div className="mb-4">
								<label
									htmlFor="reportDetails"
									className="block text-sm font-medium mb-1"
								>
									Additional details
								</label>
								<Textarea
									id="reportDetails"
									placeholder="Please provide any additional details that might help us understand the issue"
									value={reportDetails}
									onChange={(e) =>
										setReportDetails(e.target.value)
									}
									rows={3}
									className="custom-textarea"
								/>
							</div>

							{error && (
								<Alert variant="destructive" className="mb-4">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}
						</div>

						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setShowReportModal(false)}
								disabled={isReporting}
							>
								Cancel
							</Button>
							<Button
								variant="outline"
								onClick={submitReport}
								disabled={isReporting}
								className="bg-red-500 hover:bg-red-600 text-white hover:text-white"
							>
								{isReporting ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Submitting...
									</>
								) : (
									"Submit Report"
								)}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

			{/* Volunteer Profile Modal */}
			{selectedVolunteerForProfile && (
				<Dialog
					open={showVolunteerProfileModal}
					onOpenChange={setShowVolunteerProfileModal}
				>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Volunteer Profile</DialogTitle>
							<DialogDescription>
								Volunteer information and registration details
							</DialogDescription>
						</DialogHeader>

						<div className="py-4">
							<div className="flex flex-col space-y-4">
								<div>
									<h3 className="text-lg font-medium">
										Personal Information
									</h3>
									<div className="mt-2 grid grid-cols-2 gap-2">
										<span className="text-gray-600">
											Name:
										</span>
										<span className="font-medium">
											{selectedVolunteerForProfile
												.volunteer_data?.name ||
												"Not provided"}
										</span>

										<span className="text-gray-600">
											Contact:
										</span>
										<span className="font-medium">
											{selectedVolunteerForProfile
												.volunteer_data?.phone ||
												"Not provided"}
										</span>

										<span className="text-gray-600">
											Date of Birth:
										</span>
										<span className="font-medium">
											{selectedVolunteerForProfile
												.volunteer_data?.dob
												? new Date(
														selectedVolunteerForProfile.volunteer_data.dob
												  ).toLocaleDateString()
												: "Not provided"}
										</span>

										{selectedVolunteerForProfile
											.volunteer_data?.skills?.length >
											0 && (
											<>
												<span className="text-gray-600">
													Skills:
												</span>
												<div className="flex flex-wrap gap-1">
													{selectedVolunteerForProfile.volunteer_data.skills.map(
														(skill, i) => (
															<span
																key={i}
																className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
															>
																{skill}
															</span>
														)
													)}
												</div>
											</>
										)}
									</div>
								</div>

								<div>
									<h3 className="text-lg font-medium">
										Registration Information
									</h3>
									<div className="mt-2 grid grid-cols-2 gap-2">
										<span className="text-gray-600">
											Registration Date:
										</span>
										<span className="font-medium">
											{new Date(
												selectedVolunteerForProfile.signup_date
											).toLocaleDateString()}
										</span>

										<span className="text-gray-600">
											Status:
										</span>
										<span className="font-medium">
											{selectedVolunteerForProfile.status ===
											"removed_by_organizer"
												? "Removed"
												: selectedVolunteerForProfile.attendance_status ===
												  "attended"
												? "Attended"
												: "Registered"}
										</span>

										<span className="text-gray-600">
											Attendance:
										</span>
										<span className="font-medium">
											{selectedVolunteerForProfile.attendance_status ===
											"attended"
												? "Attended"
												: selectedVolunteerForProfile.attendance_status ===
												  "not_attended"
												? "Not Attended"
												: "Pending"}
										</span>

										<span className="text-gray-600">
											Checked In:
										</span>
										<span className="font-medium">
											{selectedVolunteerForProfile.check_in_time
												? new Date(
														selectedVolunteerForProfile.check_in_time
												  ).toLocaleString()
												: "Not checked in"}
										</span>
									</div>
								</div>
							</div>
						</div>

						<DialogFooter>
							<Button
								variant="outline"
								onClick={() =>
									setShowVolunteerProfileModal(false)
								}
							>
								Close
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

			{/* Pagination Component */}
			<div className="mt-4 flex justify-center gap-2">
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
							Math.ceil(
								filteredVolunteers.length / volunteersPerPage
							)
						),
					}).map((_, index) => {
						const pageNumber = index + 1;
						if (
							pageNumber === 1 ||
							pageNumber ===
								Math.ceil(
									filteredVolunteers.length /
										volunteersPerPage
								) ||
							(pageNumber >= currentPage - 1 &&
								pageNumber <= currentPage + 1)
						) {
							return (
								<Button
									key={pageNumber}
									variant={
										pageNumber === currentPage
											? "default"
											: "outline"
									}
									size="sm"
									onClick={() => handlePageChange(pageNumber)}
									className="min-w-[40px]"
								>
									{pageNumber}
								</Button>
							);
						} else if (
							(pageNumber === currentPage - 2 &&
								pageNumber > 1) ||
							(pageNumber === currentPage + 2 &&
								pageNumber <
									Math.ceil(
										filteredVolunteers.length /
											volunteersPerPage
									))
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

				{currentPage <
					Math.ceil(
						filteredVolunteers.length / volunteersPerPage
					) && (
					<Button
						variant="outline"
						onClick={() => handlePageChange(currentPage + 1)}
					>
						Next
					</Button>
				)}
			</div>

			{/* Page information Text */}
			<div className="mt-2 text-center text-sm text-gray-500">
				Page {currentPage} of{" "}
				{Math.max(
					1,
					Math.ceil(filteredVolunteers.length / volunteersPerPage)
				)}
				{filteredVolunteers.length > 0 && (
					<span>
						{" "}
						• Showing{" "}
						{Math.min(
							volunteersPerPage,
							filteredVolunteers.length -
								(currentPage - 1) * volunteersPerPage
						)}
						of {filteredVolunteers.length} volunteers
					</span>
				)}
			</div>
		</div>
	);
};

export default EventVolunteersPage;
