import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Api from "../../../helpers/Api";
import { getProfileImageUrl } from "../../../helpers/profileHelper";

const AdminUsers = () => {
	const [users, setUsers] = useState([]);
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
		role: "",
		status: "",
		search: "",
		page: 1,
	});

	useEffect(() => {
		fetchUsers();
	}, [filters]);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const response = await Api.getAdminUsers(filters);
			const data = await response.json();
			// const testVolunteer = data.users.find(u => u.role === 'volunteer');
			// const testOrganizer = data.users.find(u => u.role === 'organiser');
			//console.log("Sample volunteer:", testVolunteer?.profile);
			// console.log("Sample organizer:", testOrganizer?.profile);
			if (!response.ok) {
				throw new Error(data.message || "Failed to fetch users");
			}
			setUsers(data.users);
			setPagination(data.pagination);
		} catch (err) {
			console.error("Error fetching users:", err);
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

	const handleSearch = (e) => {
		e.preventDefault();
		// The search will trigger via useEffect when filters change
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

	// Function to render role badge
	const getRoleBadge = (role) => {
		switch (role) {
			case "volunteer":
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
						Volunteer
					</span>
				);
			case "organiser":
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
						Organiser
					</span>
				);
			case "admin":
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
						Admin
					</span>
				);
			default:
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
						{role}
					</span>
				);
		}
	};

	// Function to get verification status badge
	const getVerificationBadge = (status) => {
		switch (status) {
			case "verified":
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
						Verified
					</span>
				);
			case "pending_verification":
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
						Pending Verification
					</span>
				);
			case "pending_upload":
				return (
					<span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
						Pending User Upload
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

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Manage Users</h1>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-lg shadow p-6 mb-6">
				<h2 className="text-xl font-semibold mb-4">Filters</h2>
				<form
					onSubmit={handleSearch}
					className="grid grid-cols-1 md:grid-cols-4 gap-4"
				>
					<div>
						<label
							className="block text-gray-700 text-sm font-bold mb-2"
							htmlFor="role"
						>
							Role
						</label>
						<select
							id="role"
							name="role"
							value={filters.role}
							onChange={handleFilterChange}
							className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
						>
							<option value="">All Roles</option>
							<option value="volunteer">Volunteer</option>
							<option value="organiser">Organiser</option>
							<option value="admin">Admin</option>
						</select>
					</div>

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
							<option value="active">Active</option>
							<option value="suspended">Suspended</option>
							<option value="inactive">Inactive</option>
						</select>
					</div>

					<div>
						<label
							className="block text-gray-700 text-sm font-bold mb-2"
							htmlFor="search"
						>
							Search by Email
						</label>
						<input
							id="search"
							name="search"
							type="text"
							placeholder="Search email..."
							value={filters.search}
							onChange={handleFilterChange}
							className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
						/>
					</div>

					<div className="flex items-end">
						<button
							type="submit"
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
						>
							Search
						</button>
					</div>
				</form>
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
						onClick={fetchUsers}
					>
						Try Again
					</button>
				</div>
			)}

			{/* Users Table */}
			{!loading && !error && (
				<div className="bg-white rounded-lg shadow overflow-hidden">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									User
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Role
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
									Profile
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
							{users.length > 0 ? (
								users.map((user) => (
									<tr key={user._id}>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="flex-shrink-0 h-10 w-10">
													{user.profile
														?.profile_picture_url ? (
														<img
															className="h-10 w-10 rounded-full"
															src={getProfileImageUrl(
																user,
																user.profile
																	.profile_picture_url
															)}
															alt={
																user.profile
																	?.name ||
																user.profile
																	?.organisation_name ||
																"User"
															}
														/>
													) : (
														<div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
															{(
																user.profile?.name?.charAt(
																	0
																) ||
																user.profile?.organisation_name?.charAt(
																	0
																) ||
																user.email.charAt(
																	0
																)
															).toUpperCase()}
														</div>
													)}
												</div>
												<div className="ml-4">
													<div className="text-sm font-medium text-gray-900">
														{/* TODO: FIX */}
														{user.profile?.name ||
															user.profile
																?.organisation_name ||
															"Unknown"}
													</div>
													<div className="text-sm text-gray-500">
														{user.email}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{getRoleBadge(user.role)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{getStatusBadge(user.status)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{user.role === "volunteer" ? (
												<span>
													Verification:{" "}
													{user.profile?.nric_image
														?.verified
														? getVerificationBadge(
																"verified"
														  )
														: user.profile
																?.nric_image
																?.filename
														? getVerificationBadge(
																"pending_verification"
														  )
														: getVerificationBadge(
																"pending_upload"
														  )}
												</span>
											) : user.role === "organiser" ? (
												<span>
													Verification:{" "}
													{user.profile
														?.certification_document
														?.verified ||
													user.profile
														?.verification_status ===
														"verified"
														? getVerificationBadge(
																"verified"
														  )
														: user.profile
																?.certification_document
																?.filename
														? getVerificationBadge(
																"pending_verification"
														  )
														: getVerificationBadge(
																"pending_upload"
														  )}
												</span>
											) : (
												<span>Admin Account</span>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<Link
												to={`/admin/users/${user._id}`}
												className="text-indigo-600 hover:text-indigo-900 mr-4"
											>
												View
											</Link>
											<button
												className={`${
													user.status === "active"
														? "text-yellow-600 hover:text-yellow-900"
														: "text-green-600 hover:text-green-900"
												}`}
												onClick={() => {
													// This would typically open a confirmation modal
													alert(
														`This would ${
															user.status ===
															"active"
																? "suspend"
																: "activate"
														} the user account.`
													);
												}}
											></button>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan="5"
										className="px-6 py-4 text-center text-gray-500"
									>
										No users found matching the criteria.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			)}

			{/* Pagination */}
			{!loading && !error && users.length > 0 && (
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

export default AdminUsers;
