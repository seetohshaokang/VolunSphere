import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Api from "../../../helpers/Api";

const AdminReports = () => {
	const [reports, setReports] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		page: 1,
		pages: 1,
		limit: 10,
		total: 0,
	});

	// Filters
	const [filters, setFilters] = useState({
		status: "",
		reported_type: "",
		page: 1,
	});

	useEffect(() => {
		fetchReports();
	}, [filters]);

	const fetchReports = async () => {
		try {
			setLoading(true);
			const response = await Api.getAdminReports(filters);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to fetch reports");
			}

			setReports(data.reports);
			setPagination(data.pagination);
		} catch (err) {
			console.error("Error fetching reports:", err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setFilters((prev) => ({
			...prev,
			[name]: value,
			page: 1, // Reset to first page when filter changes
		}));
	};

	const handlePageChange = (newPage) => {
		if (newPage < 1 || newPage > pagination.pages) return;
		setFilters((prev) => ({
			...prev,
			page: newPage,
		}));
	};

	// Function to get appropriate status badge
	const getStatusBadge = (status) => {
		switch (status) {
			case "pending":
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
						Pending
					</span>
				);
			case "under_review":
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
						Under Review
					</span>
				);
			case "resolved":
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
						Resolved
					</span>
				);
			case "dismissed":
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
						Dismissed
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

	// Function to get reported type badge
	const getReportedTypeBadge = (type) => {
		switch (type) {
			case "Volunteer":
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
						Volunteer
					</span>
				);
			case "Organiser":
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
						Organiser
					</span>
				);
			case "Event":
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
						Event
					</span>
				);
			default:
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
						{type}
					</span>
				);
		}
	};

	// Function to format date
	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleString();
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Manage Reports</h1>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-lg shadow p-6 mb-6">
				<h2 className="text-xl font-semibold mb-4">Filters</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label
							className="block text-gray-700 text-sm font-bold mb-2"
							htmlFor="status"
						>
							Status
						</label>
						<select
							id="status"
							name="status"
							value={filters.status}
							onChange={handleFilterChange}
							className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
						>
							<option value="">All Statuses</option>
							<option value="pending">Pending</option>
							<option value="under_review">Under Review</option>
							<option value="resolved">Resolved</option>
							<option value="dismissed">Dismissed</option>
						</select>
					</div>

					<div>
						<label
							className="block text-gray-700 text-sm font-bold mb-2"
							htmlFor="reported_type"
						>
							Reported Type
						</label>
						<select
							id="reported_type"
							name="reported_type"
							value={filters.reported_type}
							onChange={handleFilterChange}
							className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
						>
							<option value="">All Types</option>
							<option value="Volunteer">Volunteer</option>
							<option value="Organiser">Organiser</option>
							<option value="Event">Event</option>
						</select>
					</div>
				</div>
			</div>

			{/* Loading and Error States */}
			{loading && (
				<div className="flex justify-center items-center h-64">
					<div className="spinner-border text-primary" role="status">
						<span className="sr-only">Loading...</span>
					</div>
				</div>
			)}

			{error && !loading && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					<p>Error: {error}</p>
					<button
						className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
						onClick={fetchReports}
					>
						Try Again
					</button>
				</div>
			)}

			{/* Reports Table */}
			{!loading && !error && (
				<div className="bg-white rounded-lg shadow overflow-x-auto">
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
									Reported
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
							{reports.length > 0 ? (
								reports.map((report) => (
									<tr key={report._id}>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{formatDate(report.created_at)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">
													{report.reporter_id
														?.email || "Unknown"}
												</div>
												<div className="text-sm text-gray-500">
													{report.reporter_role}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">
													{getReportedTypeBadge(
														report.reported_type
													)}
												</div>
												<div className="text-sm text-gray-500">
													{report.reported_id?.name ||
														report.reported_id
															?.organisation_name ||
														"Unknown"}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{report.reason.substring(0, 30)}
											{report.reason.length > 30
												? "..."
												: ""}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{getStatusBadge(report.status)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<Link
												to={`/admin/reports/${report._id}`}
												className="text-indigo-600 hover:text-indigo-900"
											>
												View
											</Link>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan="6"
										className="px-6 py-4 text-center text-gray-500"
									>
										No reports found matching the criteria.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			)}

			{/* Pagination */}
			{!loading && !error && reports.length > 0 && (
				<div className="flex justify-between items-center mt-6">
					<div className="text-sm text-gray-700">
						Showing{" "}
						<span className="font-medium">
							{(pagination.page - 1) * pagination.limit + 1}
						</span>{" "}
						to{" "}
						<span className="font-medium">
							{Math.min(
								pagination.page * pagination.limit,
								pagination.total
							)}
						</span>{" "}
						of{" "}
						<span className="font-medium">{pagination.total}</span>{" "}
						results
					</div>
					<div className="flex space-x-2">
						<button
							onClick={() =>
								handlePageChange(pagination.page - 1)
							}
							disabled={pagination.page === 1}
							className={`px-4 py-2 border rounded ${
								pagination.page === 1
									? "bg-gray-100 text-gray-400 cursor-not-allowed"
									: "bg-white text-gray-700 hover:bg-gray-50"
							}`}
						>
							Previous
						</button>
						<button
							onClick={() =>
								handlePageChange(pagination.page + 1)
							}
							disabled={pagination.page === pagination.pages}
							className={`px-4 py-2 border rounded ${
								pagination.page === pagination.pages
									? "bg-gray-100 text-gray-400 cursor-not-allowed"
									: "bg-white text-gray-700 hover:bg-gray-50"
							}`}
						>
							Next
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminReports;
