import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import ContentHeader from "../../../components/ContentHeader";
import DocumentViewer from "../../../components/DocumentViewer";
import Api from "../../../helpers/Api";

const AdminUserDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showStatusModal, setShowStatusModal] = useState(false);
	const [newStatus, setNewStatus] = useState("");
	const [statusReason, setStatusReason] = useState("");
	const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
	const [showReasonWarning, setShowReasonWarning] = useState(false);
	const [showRejectionModal, setShowRejectionModal] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");
	const [rejectionLoading, setRejectionLoading] = useState(false);
	const [showRejectionReasonWarning, setShowRejectionReasonWarning] =
		useState(false);
	const [isRejectionForVolunteer, setIsRejectionForVolunteer] =
		useState(false);
	const [showVerificationModal, setShowVerificationModal] = useState(false);

	useEffect(() => {
		fetchUserData();
	}, []);

	const fetchUserData = async () => {
		try {
			setLoading(true);
			const response = await Api.getUserById(id);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to fetch user details");
			}

			setUserData(data);
			if (data.user) {
				setNewStatus(data.user.status);
			}
		} catch (err) {
			console.error("Error fetching user details:", err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleStatusUpdate = async () => {
		if (!statusReason.trim()) {
			setShowReasonWarning(true);
			return;
		}

		setShowReasonWarning(false);

		if (!newStatus || newStatus === userData.user.status) {
			setShowStatusModal(false);
			return;
		}

		try {
			setStatusUpdateLoading(true);
			const response = await Api.updateUserStatus(
				id,
				newStatus,
				statusReason
			);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to update user status");
			}

			setUserData((prev) => ({
				...prev,
				user: {
					...prev.user,
					status: newStatus,
				},
			}));

			setShowStatusModal(false);
			setStatusReason("");

			toast.success("User status update successfully");
			await fetchUserData();
		} catch (err) {
			console.error("Error updating user status:", err);
			toast.error(`Error: ${err.message}`);
		} finally {
			setStatusUpdateLoading(false);
		}
	};

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleString();
	};

	const getStatusBadge = (status) => {
		switch (status) {
			case "active":
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
						Active
					</span>
				);
			case "suspended":
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
						Suspended
					</span>
				);
			case "inactive":
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
						Inactive
					</span>
				);
			default:
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
						{status}
					</span>
				);
		}
	};

	const handleOpenRejectionModal = (isVolunteer = false) => {
		setRejectionReason("");
		setShowRejectionReasonWarning(false);
		setIsRejectionForVolunteer(isVolunteer);
		setShowRejectionModal(true);
	};

	const handleApproveNRIC = async () => {
		try {
			if (userData?.profile?.nric_image?.filename) {
				localStorage.setItem(
					"currentNricFilename",
					userData.profile.nric_image.filename
				);
			}

			const response = await Api.updateVolunteerVerification(
				userData.profile._id,
				true,
				"NRIC verified by admin"
			);

			let data;
			try {
				data = await response.json();
			} catch (e) {
				console.log("Could not parse response as JSON", e);
			}

			if (!response.ok) {
				throw new Error(
					data?.message ||
						`Failed to update verification status: ${response.status}`
				);
			}

			setUserData((prev) => {
				const updatedProfile = { ...prev.profile };

				if (!updatedProfile.nric_image) {
					updatedProfile.nric_image = {
						filename:
							userData?.profile?.nric_image?.filename || null,
						verified: true,
					};
				} else {
					updatedProfile.nric_image.verified = true;
				}

				return {
					...prev,
					profile: updatedProfile,
				};
			});

			localStorage.removeItem("currentNricFilename");

			toast.success("NRIC verification approved successfully");
		} catch (err) {
			console.error("Error updating NRIC verification:", err);
			toast.error(`Error: ${err.message}`);
			localStorage.removeItem("currentNricFilename");
		}
	};

	const handleRejectWithReason = async () => {
		if (!rejectionReason.trim()) {
			setShowRejectionReasonWarning(true);
			return;
		}

		setShowRejectionReasonWarning(false);
		setRejectionLoading(true);

		try {
			if (isRejectionForVolunteer) {
				if (userData?.profile?.nric_image?.filename) {
					localStorage.setItem(
						"currentNricFilename",
						userData.profile.nric_image.filename
					);
				}

				const response = await Api.updateVolunteerVerification(
					userData.profile._id,
					false,
					rejectionReason
				);

				const data = await response.json();

				if (!response.ok) {
					throw new Error(
						data.message || "Failed to update verification status"
					);
				}

				setUserData((prev) => {
					return {
						...prev,
						profile: {
							...prev.profile,
							nric_image: {
								...prev.profile.nric_image,
								verified: false,
								requires_reupload: true,
								rejection_reason: rejectionReason,
							},
						},
					};
				});

				localStorage.removeItem("currentNricFilename");
			} else {
				const response = await Api.updateOrganiserVerification(
					userData.profile._id,
					"rejected",
					rejectionReason
				);

				const data = await response.json();

				if (!response.ok) {
					throw new Error(
						data.message || "Failed to update verification status"
					);
				}

				setUserData((prev) => ({
					...prev,
					profile: {
						...prev.profile,
						verification_status: "rejected",
					},
				}));
			}

			setShowRejectionModal(false);
			toast.success(
				`${isRejectionForVolunteer ? "NRIC" : "Organization"} `
			);
		} catch (err) {
			console.error("Error updating verification status:", err);
			toast.error(`Error: ${err.message}`);
		} finally {
			setRejectionLoading(false);
		}
	};

	const handleApproveOrganization = async () => {
		try {
			if (
				!userData.profile?.certification_document ||
				!userData.profile?.certification_document?.filename
			) {
				alert(
					"Cannot approve an organization without an uploaded certification document"
				);
				return;
			}

			const response = await Api.updateOrganiserVerification(
				userData.profile._id,
				"verified",
				"Organization verified by admin"
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					data.message || "Failed to update verification status"
				);
			}

			setUserData((prev) => ({
				...prev,
				profile: {
					...prev.profile,
					verification_status: "verified",
				},
			}));
			toast.success("Organization verification approved successfully");
		} catch (err) {
			console.error("Error updating organization verification:", err);
			toast.error(`Error: ${err.message}`);
		}
	};

	const confirmSignup = async () => {
		setIsLoading(true);

		try {
			console.log("Attempting to sign up for event:", eventId);
			const response = await Api.registerForEvent(eventId);

			const data = await response.json();
			console.log("Signup response:", data);

			if (response.ok) {
				setSuccessMessage(
					"You have successfully signed up for this event."
				);

				setIsSignedUp(true);
				fetchEventDetails();
				setTimeout(() => {
					setSuccessMessage(null);
				}, 3000);
			} else {
				if (
					data.message &&
					data.message.includes("already signed up")
				) {
					setSuccessMessage(
						"You are already signed up for this event."
					);
					setIsSignedUp(true);
				} else if (
					data.message &&
					data.message.includes("recurring event")
				) {
					setError(
						data.message || "Cannot sign up for recurring event"
					);
				} else if (data.requiresVerification) {
					setShowVerificationModal(true);
				} else {
					setError(
						data.message ||
							"Failed to sign up for the event. Please try again."
					);
				}
			}
		} catch (error) {
			console.error("Error signing up for event:", error);
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setIsLoading(false);
			setShowConfirmModal(false);
			checkSignupStatus();
		}
	};

	const handleGoToProfile = () => {
		setShowVerificationModal(false);
		navigate("/profile");
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					<p>Error: {error}</p>
					<div className="flex justify-between mt-4">
						<button
							className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
							onClick={fetchUserData}
						>
							Try Again
						</button>
						<button
							className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
							onClick={() => navigate("/admin/users")}
						>
							Back to Users
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (!userData) return null;

	const {
		user,
		profile,
		events = [],
		registrations = [],
		reports = [],
		actions = [],
	} = userData;

	const getVolunteerVerificationStatus = () => {
		if (profile?.nric_image?.verified) {
			return <span className="text-green-600">Verified</span>;
		} else if (profile?.nric_image?.requires_reupload) {
			return <span className="text-red-600">Rejected</span>;
		} else if (profile?.nric_image?.filename) {
			return (
				<span className="text-yellow-600">Pending Verification</span>
			);
		} else {
			return <span className="text-yellow-600">Pending Upload</span>;
		}
	};

	return (
		<>
			<ContentHeader title="User Details" />

			<div className="flex justify-end mb-6">
				<button
					onClick={() => setShowStatusModal(true)}
					className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-center focus:outline-none focus:shadow-outline"
				>
					Change User Status
				</button>
			</div>

			{/* User and Profile Information */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<div className="bg-white rounded-lg border p-6 col-span-2">
					<h2 className="text-xl font-semibold mb-4">
						User Information
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<p className="text-gray-600">Email:</p>
							<p className="font-medium">{user.email}</p>
						</div>
						<div>
							<p className="text-gray-600">Role:</p>
							<p className="font-medium">{user.role}</p>
						</div>
						<div>
							<p className="text-gray-600">Status:</p>
							<p>{getStatusBadge(user.status)}</p>
						</div>
						<div>
							<p className="text-gray-600">Created:</p>
							<p className="font-medium">
								{formatDate(user.created_at)}
							</p>
						</div>
						<div>
							<p className="text-gray-600">Last Login:</p>
							<p className="font-medium">
								{formatDate(user.last_login)}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg border p-6">
					<h2 className="text-xl font-semibold mb-4">
						Profile Details
					</h2>
					{user.role === "volunteer" ? (
						<div className="space-y-3">
							<div>
								<p className="text-gray-600">Name:</p>
								<p className="font-medium">
									{profile?.name || "Not provided"}
								</p>
							</div>
							<div>
								<p className="text-gray-600">Phone:</p>
								<p className="font-medium">
									{profile?.phone || "Not provided"}
								</p>
							</div>
							<div className="flex justify-between items-center">
								<div>
									<p className="text-gray-600">
										Verification Status:
									</p>
									<p className="font-medium">
										{getVolunteerVerificationStatus()}
									</p>
								</div>
								{!profile?.nric_image?.verified &&
									!profile?.nric_image?.requires_reupload &&
									profile?.nric_image?.filename && (
										<div className="flex space-x-2">
											<button
												onClick={handleApproveNRIC}
												className="bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 rounded"
											>
												Approve
											</button>
											<button
												onClick={() =>
													handleOpenRejectionModal(
														true
													)
												}
												className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded"
											>
												Reject
											</button>
										</div>
									)}
							</div>

							{/* NRIC Image Viewer */}
							<div className="mt-4">
								<p className="text-gray-600 mb-2">
									NRIC Image:
								</p>
								{profile?.nric_image?.filename ? (
									<DocumentViewer
										filename={profile.nric_image.filename}
										documentType="nric"
										className="w-full border rounded-md"
									/>
								) : (
									<p className="text-gray-500">
										No NRIC image uploaded
									</p>
								)}
							</div>

							<div>
								<p className="text-gray-600">Skills:</p>
								<div className="flex flex-wrap gap-1 mt-1">
									{profile?.skills?.length > 0 ? (
										profile.skills.map((skill, index) => (
											<span
												key={index}
												className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
											>
												{skill}
											</span>
										))
									) : (
										<span className="text-gray-500">
											No skills listed
										</span>
									)}
								</div>
							</div>
							<div>
								<p className="text-gray-600">
									Preferred Causes:
								</p>
								<div className="flex flex-wrap gap-1 mt-1">
									{profile?.preferred_causes?.length > 0 ? (
										profile.preferred_causes.map(
											(cause, index) => (
												<span
													key={index}
													className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
												>
													{cause}
												</span>
											)
										)
									) : (
										<span className="text-gray-500">
											No preferred causes listed
										</span>
									)}
								</div>
							</div>
						</div>
					) : user.role === "organiser" ? (
						<div className="space-y-3">
							<div>
								<p className="text-gray-600">Organisation:</p>
								<p className="font-medium">
									{profile?.organisation_name ||
										"Not provided"}
								</p>
							</div>
							<div>
								<p className="text-gray-600">Phone:</p>
								<p className="font-medium">
									{profile?.phone || "Not provided"}
								</p>
							</div>
							<div className="flex justify-between items-center">
								<div>
									<p className="text-gray-600">
										Verification Status:
									</p>
									<p className="font-medium">
										{profile?.verification_status ===
										"verified" ? (
											<span className="text-green-600">
												Verified
											</span>
										) : profile?.verification_status ===
										  "rejected" ? (
											<span className="text-red-600">
												Rejected
											</span>
										) : profile?.certification_document
												?.filename ? (
											<span className="text-yellow-600">
												Pending Verification
											</span>
										) : (
											<span className="text-yellow-600">
												Pending User Upload
											</span>
										)}
									</p>
								</div>
								{profile?.verification_status === "pending" &&
									profile?.certification_document
										?.filename && (
										<div className="flex space-x-2">
											<button
												onClick={
													handleApproveOrganization
												}
												className="bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 rounded"
											>
												Approve
											</button>
											<button
												onClick={() =>
													handleOpenRejectionModal(
														false
													)
												}
												className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded"
											>
												Reject
											</button>
										</div>
									)}
							</div>

							{/* Certification Document Viewer Section */}
							<div className="mt-4">
								<p className="text-gray-600 mb-2">
									Certification Document:
								</p>
								{profile?.certification_document?.filename ? (
									<DocumentViewer
										filename={
											profile.certification_document
												.filename
										}
										documentType="certification"
										className="w-full border rounded-md"
									/>
								) : (
									<p className="text-gray-500">
										No certification document uploaded
									</p>
								)}
							</div>

							<div>
								<p className="text-gray-600">Website:</p>
								<p className="font-medium">
									{profile?.website || "Not provided"}
								</p>
							</div>
						</div>
					) : (
						<p className="text-gray-500">
							Admin account - no profile details available
						</p>
					)}
				</div>
			</div>

			{/* Activity Details Tabs */}
			<div className="bg-white rounded-lg border p-6 mb-8">
				<h2 className="text-xl font-semibold mb-4">Activity</h2>

				{/* Events for organiser */}
				{user.role === "organiser" && (
					<div className="mb-6">
						<h3 className="text-lg font-medium mb-3">
							Organized Events
						</h3>
						{events.length > 0 ? (
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Name
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Date
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Status
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Registrations
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{events.map((event) => (
											<tr key={event._id}>
												<td className="px-6 py-4 whitespace-nowrap">
													{event.name}
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													{formatDate(
														event.start_datetime ||
															event.recurrence_start_date
													)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<span
														className={`px-2 py-1 text-xs rounded-full ${
															event.status ===
															"active"
																? "bg-green-100 text-green-800"
																: event.status ===
																  "completed"
																? "bg-blue-100 text-blue-800"
																: event.status ===
																  "cancelled"
																? "bg-red-100 text-red-800"
																: "bg-gray-100 text-gray-800"
														}`}
													>
														{event.status
															.charAt(0)
															.toUpperCase() +
															event.status.slice(
																1
															)}
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													{event.registered_count} /{" "}
													{event.max_volunteers ||
														"Unlimited"}
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<Link
														to={`/admin/events/${event._id}`}
														className="text-primary hover:text-primary/80"
													>
														View
													</Link>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<p className="text-gray-500">
								No events organized by this user.
							</p>
						)}
					</div>
				)}

				{/* Registrations for volunteer */}
				{user.role === "volunteer" && (
					<div className="mb-6">
						<h3 className="text-lg font-medium mb-3">
							Event Registrations
						</h3>
						{registrations.length > 0 ? (
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Event
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Date
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Status
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{registrations.map((reg) => (
											<tr key={reg._id}>
												<td className="px-6 py-4 whitespace-nowrap">
													{reg.event_id?.name ||
														"Unknown Event"}
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													{formatDate(
														reg.registration_date
													)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<span
														className={`px-2 py-1 text-xs rounded-full ${
															reg.status ===
															"registered"
																? "bg-blue-100 text-blue-800"
																: reg.status ===
																  "attended"
																? "bg-green-100 text-green-800"
																: reg.status ===
																  "no_show"
																? "bg-red-100 text-red-800"
																: "bg-gray-100 text-gray-800"
														}`}
													>
														{reg.status
															.charAt(0)
															.toUpperCase() +
															reg.status.slice(1)}
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<Link
														to={`/admin/events/${reg.event_id?._id}`}
														className="text-primary hover:text-primary/80"
													>
														View Event
													</Link>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<p className="text-gray-500">
								No event registrations for this user.
							</p>
						)}
					</div>
				)}

				{/* Reports */}
				<div className="mb-6">
					<h3 className="text-lg font-medium mb-3">
						Submitted Reports
					</h3>
					{reports.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Date
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Type
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Reason
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Status
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{reports.map((report) => (
										<tr key={report._id}>
											<td className="px-6 py-4 whitespace-nowrap">
												{formatDate(report.created_at)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{report.reported_type}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{report.reason.substring(0, 30)}
												...
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`px-2 py-1 text-xs rounded-full ${
														report.status ===
														"pending"
															? "bg-yellow-100 text-yellow-800"
															: report.status ===
															  "under_review"
															? "bg-blue-100 text-blue-800"
															: report.status ===
															  "resolved"
															? "bg-green-100 text-green-800"
															: "bg-gray-100 text-gray-800"
													}`}
												>
													{report.status
														.charAt(0)
														.toUpperCase() +
														report.status
															.slice(1)
															.replace("_", " ")}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<Link
													to={`/admin/reports/${report._id}`}
													className="text-primary hover:text-primary/80"
												>
													View
												</Link>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<p className="text-gray-500">
							No reports submitted by this user.
						</p>
					)}
				</div>

				{/* Admin Actions */}
				<div>
					<h3 className="text-lg font-medium mb-3">Admin Actions</h3>
					{actions.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Date
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Action
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Admin
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Reason
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{actions.map((action) => (
										<tr key={action._id}>
											<td className="px-6 py-4 whitespace-nowrap">
												{formatDate(action.date)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{action.action}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{action.admin_id?.name ||
													"Unknown Admin"}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												{action.reason}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<p className="text-gray-500">
							No admin actions taken for this user.
						</p>
					)}
				</div>
			</div>

			{/* Status Update */}
			{showStatusModal && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
					<div className="relative mx-auto p-6 border w-full max-w-md shadow-lg rounded-md bg-white">
						<div>
							<h3 className="text-xl font-semibold text-gray-900 text-center mb-4">
								Update User Status
							</h3>
							<div className="mt-4">
								<div className="mb-5">
									<label className="block text-gray-700 text-base font-medium mb-2">
										Current Status:{" "}
										{getStatusBadge(userData.user.status)}
									</label>
									<select
										className="shadow border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline cursor-pointer"
										value={newStatus}
										onChange={(e) =>
											setNewStatus(e.target.value)
										}
									>
										<option
											value="active"
											className="cursor-pointer py-2"
										>
											Active
										</option>
										<option
											value="suspended"
											className="cursor-pointer py-2"
										>
											Suspended
										</option>
										<option
											value="inactive"
											className="cursor-pointer py-2"
										>
											Inactive
										</option>
									</select>
								</div>
								<div className="mb-6">
									<label className="block text-gray-700 text-base font-medium mb-2">
										Reason for Status Change
									</label>
									<textarea
										className="shadow border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline cursor-text"
										value={statusReason}
										onChange={(e) => {
											setStatusReason(e.target.value);
											if (e.target.value.trim())
												setShowReasonWarning(false);
										}}
										rows="4"
										placeholder="Provide a reason for this status change"
									></textarea>

									{showReasonWarning && (
										<p className="text-sm text-red-500 mt-1">
											This field is required.
										</p>
									)}
								</div>
								<div className="flex items-center justify-between">
									<button
										onClick={() =>
											setShowStatusModal(false)
										}
										className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-md focus:outline-none focus:shadow-outline cursor-pointer"
										disabled={statusUpdateLoading}
									>
										Cancel
									</button>
									<button
										onClick={handleStatusUpdate}
										className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-md focus:outline-none focus:shadow-outline cursor-pointer"
										disabled={
											statusUpdateLoading ||
											!newStatus ||
											newStatus === userData.user.status
										}
									>
										{statusUpdateLoading
											? "Updating..."
											: "Update Status"}
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Verification Rejection Reason */}
			{showRejectionModal && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
					<div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
						<div className="mt-3">
							<h3 className="text-lg leading-6 font-medium text-gray-900 text-center">
								Reject{" "}
								{isRejectionForVolunteer
									? "NRIC"
									: "Organization"}{" "}
								Verification
							</h3>
							<div className="mt-4 px-2">
								<div className="mb-4">
									<label className="block text-gray-700 text-sm font-bold mb-2">
										Rejection Reason
									</label>
									<textarea
										className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline cursor-text"
										value={rejectionReason}
										onChange={(e) => {
											setRejectionReason(e.target.value);
											if (e.target.value.trim())
												setShowRejectionReasonWarning(
													false
												);
										}}
										rows="3"
										placeholder={`Explain why the ${
											isRejectionForVolunteer
												? "NRIC"
												: "certification"
										} is being rejected`}
									></textarea>

									{showRejectionReasonWarning && (
										<p className="text-sm text-red-500 mt-1">
											Please provide a reason for
											rejection.
										</p>
									)}
								</div>
								<div className="flex items-center justify-between">
									<button
										onClick={() =>
											setShowRejectionModal(false)
										}
										className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
										disabled={rejectionLoading}
									>
										Cancel
									</button>
									<button
										onClick={handleRejectWithReason}
										className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-center focus:outline-none focus:shadow-outline"
										disabled={rejectionLoading}
									>
										{rejectionLoading
											? "Rejecting..."
											: "Reject"}
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Verification Required */}
			<Dialog
				open={showVerificationModal}
				onOpenChange={setShowVerificationModal}
			>
				<DialogContent className="sm:max-w-md bg-white">
					<DialogHeader>
						<div className="flex items-center mb-2">
							<ShieldAlert className="h-6 w-6 text-yellow-500 mr-2" />
							<DialogTitle>Verification Required</DialogTitle>
						</div>
						<DialogDescription>
							<div className="mb-4">
								<p className="mb-4">
									You are currently not verified. Before
									registering for events, please upload the
									relevant certification documents to complete
									the verification process.
								</p>

								<p className="text-sm text-gray-600">
									Verification helps establish trust with
									volunteers and ensures all organizers meet
									our community standards.
								</p>
							</div>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="sm:justify-end">
						<Button
							variant="outline"
							onClick={() => setShowVerificationModal(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleGoToProfile}>
							Go to Profile
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default AdminUserDetail;
