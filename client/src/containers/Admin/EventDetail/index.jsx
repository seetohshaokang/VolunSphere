// src/containers/Admin/EventDetail/index.jsx
import { MapPinIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import Api from "../../../helpers/Api";

const AdminEventDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [event, setEvent] = useState(null);
	const [registrations, setRegistrations] = useState([]);
	const [reports, setReports] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showStatusModal, setShowStatusModal] = useState(false);
	const [newStatus, setNewStatus] = useState("");
	const [statusReason, setStatusReason] = useState("");
	const [updateLoading, setUpdateLoading] = useState(false);

	useEffect(() => {
		fetchEventDetails();
	}, [id]);

	const fetchEventDetails = async () => {
		setLoading(true);
		setError(null);
		try {
			console.log(`Fetching event with ID: ${id}`);

			const response = await Api.getAdminEventById(id);
			console.log("Response status:", response.status);

			if (!response.ok) {
				const errorData = await response.json();
				toast.error(
					errorData.message || "Failed to fetch event details"
				);
				throw new Error(
					errorData.message || "Failed to fetch event details"
				);
			}

			const data = await response.json();
			console.log("Event data received:", data);

			setEvent(data.event);
			setRegistrations(data.registrations || []);
			setReports(data.reports || []);

			if (data.event) {
				setNewStatus(data.event.status);
			}
		} catch (error) {
			console.error("Error fetching event details:", error);
			toast.error(error.message || "Failed to fetch event details");
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};
	const handleStatusUpdate = async () => {
		if (!newStatus || newStatus === event.status) {
			setShowStatusModal(false);
			return;
		}

		try {
			setUpdateLoading(true);

			const response = await Api.updateEventStatus(
				id,
				newStatus,
				statusReason
			);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					data.message || "Failed to update event status"
				);
			}

			setEvent((prev) => ({
				...prev,
				status: newStatus,
			}));

			setShowStatusModal(false);
			setStatusReason("");
		} catch (err) {
			console.error("Error updating event status:", err);
			toast.error(`Error: ${err.message}`);
		} finally {
			setUpdateLoading(false);
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
			case "completed":
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
						Completed
					</span>
				);
			case "cancelled":
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
						Cancelled
					</span>
				);
			case "draft":
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
						Draft
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

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="spinner-border text-primary" role="status">
					<span className="sr-only">Loading...</span>
				</div>
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
							onClick={fetchEventDetails}
						>
							Try Again
						</button>
						<button
							className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
							onClick={() => navigate("/admin/events")}
						>
							Back to Events
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (!event) return null;

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Event Details</h1>
				<div>
					<button
						onClick={() => setShowStatusModal(true)}
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
					>
						Change Status
					</button>
					<Link
						to="/admin/events"
						className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
					>
						Back to Events
					</Link>
				</div>
			</div>

			{/* Event Information */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<div className="bg-white rounded-lg shadow p-6 col-span-2">
					<h2 className="text-xl font-semibold mb-4">
						Event Details
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<p className="text-gray-600">Name:</p>
							<p className="font-medium">{event.name}</p>
						</div>
						<div>
							<p className="text-gray-600">Status:</p>
							<p>{getStatusBadge(event.status)}</p>
						</div>
						<div>
							<p className="text-gray-600">Location:</p>
							<p className="font-medium">{event.location}</p>
							{event.locationUrl && (
								<div className="location-url">
									<a
										href={event.locationUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
									>
										<MapPinIcon className="h-4 w-4 mr-1" />
										View on Google Maps
									</a>
								</div>
							)}
						</div>
						<div>
							<p className="text-gray-600">Event Type:</p>
							<p className="font-medium">
								{event.is_recurring ? "Recurring" : "One-time"}
							</p>
						</div>
						{event.is_recurring ? (
							<>
								<div>
									<p className="text-gray-600">
										Recurrence Start:
									</p>
									<p className="font-medium">
										{formatDate(
											event.recurrence_start_date
										)}
									</p>
								</div>
								<div>
									<p className="text-gray-600">
										Recurrence End:
									</p>
									<p className="font-medium">
										{formatDate(event.recurrence_end_date)}
									</p>
								</div>
								<div>
									<p className="text-gray-600">
										Recurrence Pattern:
									</p>
									<p className="font-medium">
										{event.recurrence_pattern}
									</p>
								</div>
							</>
						) : (
							<>
								<div>
									<p className="text-gray-600">Start Time:</p>
									<p className="font-medium">
										{formatDate(event.start_datetime)}
									</p>
								</div>
								<div>
									<p className="text-gray-600">End Time:</p>
									<p className="font-medium">
										{formatDate(event.end_datetime)}
									</p>
								</div>
							</>
						)}
						<div>
							<p className="text-gray-600">Max Volunteers:</p>
							<p className="font-medium">
								{event.max_volunteers || "Unlimited"}
							</p>
						</div>
						<div>
							<p className="text-gray-600">
								Registered Volunteers:
							</p>
							<p className="font-medium">
								{event.registered_count || 0}
							</p>
						</div>
					</div>

					<div className="mt-6">
						<p className="text-gray-600">Description:</p>
						<p className="mt-2 p-3 bg-gray-50 rounded">
							{event.description}
						</p>
					</div>

					<div className="mt-4">
						<p className="text-gray-600">Causes/Categories:</p>
						<div className="flex flex-wrap gap-1 mt-1">
							{event.causes && event.causes.length > 0 ? (
								event.causes.map((cause, index) => (
									<span
										key={index}
										className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
									>
										{cause}
									</span>
								))
							) : (
								<span className="text-gray-500">
									No causes specified
								</span>
							)}
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-xl font-semibold mb-4">
						Organizer Information
					</h2>
					<div>
						{event.organiser_id ? (
							<div className="space-y-3">
								<div>
									<p className="text-gray-600">
										Organization:
									</p>
									<p className="font-medium">
										{event.organiser_id.organisation_name}
									</p>
								</div>
								{event.organiser_id.user_id && (
									<div>
										<p className="text-gray-600">Email:</p>
										<p className="font-medium">
											{event.organiser_id.user_id.email}
										</p>
									</div>
								)}
								<div>
									<p className="text-gray-600">Phone:</p>
									<p className="font-medium">
										{event.organiser_id.phone ||
											"Not provided"}
									</p>
								</div>
								<div>
									<p className="text-gray-600">
										Verification Status:
									</p>
									<p className="font-medium">
										{event.organiser_id
											.verification_status ===
										"verified" ? (
											<span className="text-green-600">
												Verified
											</span>
										) : (
											<span className="text-yellow-600">
												Pending
											</span>
										)}
									</p>
								</div>
								<div className="mt-4">
									<Link
										to={`/admin/users/${event.organiser_id.user_id?._id}`}
										className="text-blue-600 hover:text-blue-800"
									>
										View Organizer Profile
									</Link>
								</div>
							</div>
						) : (
							<p className="text-gray-500">
								Organizer information not available
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Registrations */}
			<div className="bg-white rounded-lg shadow p-6 mb-6">
				<h2 className="text-xl font-semibold mb-4">
					Registrations ({registrations.length})
				</h2>

				{registrations.length > 0 ? (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Volunteer
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Registration Date
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
										Check-in
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
											{reg.volunteer_id?.name ||
												"Unknown Volunteer"}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{formatDate(reg.registration_date)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`px-2 py-1 text-xs rounded-full ${
													reg.status === "registered"
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
											{reg.check_in_time
												? formatDate(reg.check_in_time)
												: "Not checked in"}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<Link
												to={`/admin/users/${reg.user_id?._id}`}
												className="text-indigo-600 hover:text-indigo-900"
											>
												View Volunteer Profile
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<p className="text-gray-500">
						No registrations found for this event.
					</p>
				)}
			</div>

			{/* Reports */}
			<div className="bg-white rounded-lg shadow p-6 mb-6">
				<h2 className="text-xl font-semibold mb-4">
					Reports ({reports.length})
				</h2>

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
										Reporter
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
											{report.reporter_id?.email ||
												"Unknown"}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{report.reason.length > 30
												? `${report.reason.substring(
														0,
														30
												  )}...`
												: report.reason}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`px-2 py-1 text-xs rounded-full ${
													report.status === "pending"
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
												className="text-indigo-600 hover:text-indigo-900"
											>
												View Report
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<p className="text-gray-500">
						No reports found for this event.
					</p>
				)}
			</div>

			{/* Status Update Modal */}
			{showStatusModal && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
					<div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
						<div className="mt-3 text-center">
							<h3 className="text-lg leading-6 font-medium text-gray-900">
								Update Event Status
							</h3>
							<div className="mt-4 px-2">
								<div className="mb-4">
									<label className="block text-gray-700 text-sm font-bold mb-2">
										Current Status:{" "}
										{getStatusBadge(event.status)}
									</label>
									<select
										className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
										value={newStatus}
										onChange={(e) =>
											setNewStatus(e.target.value)
										}
									>
										<option value="active">Active</option>
										<option value="completed">
											Completed
										</option>
										<option value="cancelled">
											Cancelled
										</option>
										<option value="draft">Draft</option>
									</select>
								</div>

								<div className="mb-4">
									<label className="block text-gray-700 text-sm font-bold mb-2">
										Reason for Status Change
									</label>
									<textarea
										className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
										value={statusReason}
										onChange={(e) =>
											setStatusReason(e.target.value)
										}
										rows="3"
										placeholder="Provide a reason for this status change"
									></textarea>
								</div>

								<div className="flex items-center justify-between">
									<button
										onClick={() =>
											setShowStatusModal(false)
										}
										className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
										disabled={updateLoading}
									>
										Cancel
									</button>
									<button
										onClick={handleStatusUpdate}
										className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
										disabled={
											updateLoading ||
											!newStatus ||
											newStatus === event.status
										}
									>
										{updateLoading
											? "Updating..."
											: "Update Status"}
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminEventDetail;
