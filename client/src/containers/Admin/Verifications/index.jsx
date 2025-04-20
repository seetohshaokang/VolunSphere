import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Api from "../../../helpers/Api";

const AdminVerifications = () => {
	const [volunteers, setVolunteers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		page: 1,
		pages: 1,
		limit: 10,
		total: 0,
	});
	const [showVerificationModal, setShowVerificationModal] = useState(false);
	const [selectedVolunteer, setSelectedVolunteer] = useState(null);
	const [verificationStatus, setVerificationStatus] = useState(true);
	const [verificationReason, setVerificationReason] = useState("");
	const [verificationLoading, setVerificationLoading] = useState(false);

	useEffect(() => {
		fetchPendingVerifications();
	}, [pagination.page]);

	const fetchPendingVerifications = async () => {
		try {
			setLoading(true);
			const response = await Api.getPendingVerifications({
				page: pagination.page,
				limit: pagination.limit,
			});
			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					data.message || "Failed to fetch pending verifications"
				);
			}

			setVolunteers(data.volunteers);
			setPagination(data.pagination);
		} catch (err) {
			console.error("Error fetching pending verifications:", err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handlePageChange = (newPage) => {
		if (newPage < 1 || newPage > pagination.pages) return;
		setPagination((prev) => ({
			...prev,
			page: newPage,
		}));
	};

	const openVerificationModal = (volunteer) => {
		setSelectedVolunteer(volunteer);
		setVerificationStatus(true);
		setVerificationReason("");
		setShowVerificationModal(true);
	};

	const handleVerification = async () => {
		if (!selectedVolunteer) return;

		try {
			setVerificationLoading(true);

			const response = await Api.updateVerificationStatus(
				selectedVolunteer._id,
				verificationStatus,
				verificationReason
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					data.message || "Failed to update verification status"
				);
			}

			setShowVerificationModal(false);

			setVolunteers((prev) =>
				prev.filter((vol) => vol._id !== selectedVolunteer._id)
			);

			setPagination((prev) => ({
				...prev,
				total: prev.total - 1,
			}));

			toast.success(
				`NRIC verification ${
					verificationStatus ? "approved" : "rejected"
				} successfully`
			);
		} catch (err) {
			console.error("Error updating verification status:", err);
			alert(`Error: ${err.message}`);
		} finally {
			setVerificationLoading(false);
		}
	};

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleString();
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">NRIC Verifications</h1>
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
						onClick={fetchPendingVerifications}
					>
						Try Again
					</button>
				</div>
			)}

			{/* Verifications List */}
			{!loading && !error && (
				<>
					{volunteers.length > 0 ? (
						<div className="bg-white rounded-lg shadow overflow-hidden">
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
											Email
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Phone
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Uploaded At
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
									{volunteers.map((volunteer) => (
										<tr key={volunteer._id}>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center">
													<div className="flex-shrink-0 h-10 w-10">
														{volunteer.profile_picture_url ? (
															<img
																className="h-10 w-10 rounded-full"
																src={
																	volunteer.profile_picture_url
																}
																alt={
																	volunteer.name
																}
															/>
														) : (
															<div className="h-10 w-10 rounded-full bg-blue-300 flex items-center justify-center text-white text-lg font-semibold">
																{volunteer.name.charAt(
																	0
																)}
															</div>
														)}
													</div>
													<div className="ml-4">
														<div className="text-sm font-medium text-gray-900">
															{volunteer.name}
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm text-gray-500">
													{volunteer.user_id?.email ||
														"Unknown"}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm text-gray-500">
													{volunteer.phone ||
														"Not provided"}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{formatDate(
													volunteer.nric_image
														?.uploaded_at
												)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
												<button
													onClick={() =>
														openVerificationModal(
															volunteer
														)
													}
													className="text-blue-600 hover:text-blue-900 mr-4"
												>
													Verify
												</button>
												<Link
													to={`/admin/users/${volunteer.user_id?._id}`}
													className="text-indigo-600 hover:text-indigo-900"
												>
													View Profile
												</Link>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className="bg-white rounded-lg shadow p-8 text-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-16 w-16 mx-auto text-gray-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<h3 className="mt-4 text-lg font-medium text-gray-900">
								No pending verifications
							</h3>
							<p className="mt-2 text-gray-500">
								All volunteer NRIC verifications have been
								processed. Check back later for new submissions.
							</p>
						</div>
					)}

					{/* Pagination */}
					{volunteers.length > 0 && (
						<div className="flex justify-between items-center mt-6">
							<div className="text-sm text-gray-700">
								Showing{" "}
								<span className="font-medium">
									{(pagination.page - 1) * pagination.limit +
										1}
								</span>{" "}
								to{" "}
								<span className="font-medium">
									{Math.min(
										pagination.page * pagination.limit,
										pagination.total
									)}
								</span>{" "}
								of{" "}
								<span className="font-medium">
									{pagination.total}
								</span>{" "}
								pending verifications
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
									disabled={
										pagination.page === pagination.pages
									}
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
				</>
			)}

			{/* Verification Modal */}
			{showVerificationModal && selectedVolunteer && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
					<div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
						<div className="mt-3">
							<h3 className="text-lg leading-6 font-medium text-gray-900 text-center">
								Verify NRIC Document
							</h3>
							<div className="mt-4 px-2">
								<div className="mb-4">
									<div className="flex justify-center mb-4">
										<div className="h-20 w-20 rounded-full bg-blue-300 flex items-center justify-center text-white text-3xl font-semibold">
											{selectedVolunteer.name.charAt(0)}
										</div>
									</div>
									<div className="text-center mb-4">
										<p className="font-bold text-lg">
											{selectedVolunteer.name}
										</p>
										<p className="text-gray-600">
											{selectedVolunteer.user_id?.email ||
												"Unknown"}
										</p>
									</div>

									<label className="block text-gray-700 text-sm font-bold mb-2">
										Verification Decision
									</label>
									<div className="flex space-x-2 mb-4">
										<button
											className={`flex-1 py-2 rounded ${
												verificationStatus
													? "bg-green-500 text-white"
													: "bg-gray-200 text-gray-700"
											}`}
											onClick={() =>
												setVerificationStatus(true)
											}
										>
											Approve
										</button>
										<button
											className={`flex-1 py-2 rounded ${
												!verificationStatus
													? "bg-red-500 text-white"
													: "bg-gray-200 text-gray-700"
											}`}
											onClick={() =>
												setVerificationStatus(false)
											}
										>
											Reject
										</button>
									</div>

									<label className="block text-gray-700 text-sm font-bold mb-2">
										Reason for{" "}
										{verificationStatus
											? "Approval"
											: "Rejection"}{" "}
										(Optional)
									</label>
									<textarea
										className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
										value={verificationReason}
										onChange={(e) =>
											setVerificationReason(
												e.target.value
											)
										}
										rows="3"
										placeholder={
											verificationStatus
												? "Approved - valid NRIC"
												: "Rejected - document unclear"
										}
									></textarea>
								</div>

								<div className="flex items-center justify-between">
									<button
										onClick={() =>
											setShowVerificationModal(false)
										}
										className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
										disabled={verificationLoading}
									>
										Cancel
									</button>
									<button
										onClick={handleVerification}
										className={`font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
											verificationStatus
												? "bg-green-500 hover:bg-green-700 text-white"
												: "bg-red-500 hover:bg-red-700 text-white"
										}`}
										disabled={verificationLoading}
									>
										{verificationLoading
											? "Processing..."
											: verificationStatus
											? "Approve"
											: "Reject"}
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

export default AdminVerifications;
