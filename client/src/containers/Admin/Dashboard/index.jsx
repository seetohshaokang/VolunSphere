import { useEffect, useState } from "react";
import Api from "../../../helpers/Api";

const AdminDashboard = () => {
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeTab, setActiveTab] = useState("overview");

	useEffect(() => {
		const fetchDashboardStats = async () => {
			try {
				setLoading(true);
				const response = await Api.getAdminDashboardStats();
				const data = await response.json();

				if (!response.ok) {
					throw new Error(
						data.message || "Failed to fetch dashboard statistics"
					);
				}

				setStats(data.stats);
			} catch (err) {
				console.error("Error fetching dashboard stats:", err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardStats();
	}, []);

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
			<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
				<p>Error: {error}</p>
				<button
					className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
					onClick={() => window.location.reload()}
				>
					Try Again
				</button>
			</div>
		);
	}

	if (!stats) return null;

	return (
		<div className="bg-white rounded-lg shadow-sm p-6">
			<h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

			{/* Dashboard Navigation Tabs */}
			<div className="border-b border-gray-200 mb-6">
				<nav className="flex space-x-4">
					<button
						onClick={() => setActiveTab("overview")}
						className={`py-2 px-1 font-medium text-sm border-b-2 ${
							activeTab === "overview"
								? "border-blue-500 text-blue-600"
								: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
						}`}
					>
						Overview
					</button>
					<button
						onClick={() => setActiveTab("users")}
						className={`py-2 px-1 font-medium text-sm border-b-2 ${
							activeTab === "users"
								? "border-blue-500 text-blue-600"
								: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
						}`}
					>
						Users
					</button>
					<button
						onClick={() => setActiveTab("events")}
						className={`py-2 px-1 font-medium text-sm border-b-2 ${
							activeTab === "events"
								? "border-blue-500 text-blue-600"
								: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
						}`}
					>
						Events
					</button>
					<button
						onClick={() => setActiveTab("reports")}
						className={`py-2 px-1 font-medium text-sm border-b-2 ${
							activeTab === "reports"
								? "border-blue-500 text-blue-600"
								: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
						}`}
					>
						Reports
					</button>
				</nav>
			</div>

			{/* Overview Tab */}
			{activeTab === "overview" && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Summary Cards */}
					<div className="bg-blue-50 rounded-lg p-5">
						<div className="flex justify-between items-start">
							<div>
								<p className="text-blue-600 font-medium">
									Total Users
								</p>
								<h3 className="text-3xl font-bold mt-1">
									{stats.users.total}
								</h3>
							</div>
							<div className="p-3 bg-blue-100 rounded-full">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6 text-blue-600"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
									/>
								</svg>
							</div>
						</div>
						<div className="mt-4">
							<p className="text-sm text-blue-600">
								New users (30d):{" "}
								<span className="font-bold">
									{stats.users.newUsers}
								</span>
							</p>
						</div>
					</div>

					<div className="bg-green-50 rounded-lg p-5">
						<div className="flex justify-between items-start">
							<div>
								<p className="text-green-600 font-medium">
									Active Events
								</p>
								<h3 className="text-3xl font-bold mt-1">
									{stats.events.active}
								</h3>
							</div>
							<div className="p-3 bg-green-100 rounded-full">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6 text-green-600"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
							</div>
						</div>
						<div className="mt-4">
							<p className="text-sm text-green-600">
								Total events:{" "}
								<span className="font-bold">
									{stats.events.total}
								</span>
							</p>
						</div>
					</div>

					<div className="bg-yellow-50 rounded-lg p-5">
						<div className="flex justify-between items-start">
							<div>
								<p className="text-yellow-600 font-medium">
									Pending Reports
								</p>
								<h3 className="text-3xl font-bold mt-1">
									{stats.reports.pending}
								</h3>
							</div>
							<div className="p-3 bg-yellow-100 rounded-full">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6 text-yellow-600"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
							</div>
						</div>
						<div className="mt-4">
							<p className="text-sm text-yellow-600">
								Under review:{" "}
								<span className="font-bold">
									{stats.reports.under_review}
								</span>
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Users Tab */}
			{activeTab === "users" && (
				<div>
					<div className="mb-6">
						<h2 className="text-xl font-semibold mb-3">
							User Statistics
						</h2>
						<div className="bg-white border rounded-lg overflow-hidden">
							<div className="p-4 grid grid-cols-3 gap-4 border-b">
								<div className="text-center">
									<p className="text-sm text-gray-500">
										Volunteers
									</p>
									<p className="text-2xl font-bold">
										{stats.users.volunteers}
									</p>
								</div>
								<div className="text-center">
									<p className="text-sm text-gray-500">
										Organisers
									</p>
									<p className="text-2xl font-bold">
										{stats.users.organisers}
									</p>
								</div>
								<div className="text-center">
									<p className="text-sm text-gray-500">
										New Users (30d)
									</p>
									<p className="text-2xl font-bold">
										{stats.users.newUsers}
									</p>
								</div>
							</div>
							<div className="p-4">
								<div className="h-8 bg-gray-100 rounded-full overflow-hidden">
									<div
										className="h-full bg-blue-500 rounded-full"
										style={{
											width: `${
												(stats.users.volunteers /
													stats.users.total) *
												100
											}%`,
										}}
									></div>
								</div>
								<div className="mt-2 flex justify-between text-sm">
									<p>
										Volunteers (
										{Math.round(
											(stats.users.volunteers /
												stats.users.total) *
												100
										)}
										%)
									</p>
									<p>
										Organisers (
										{Math.round(
											(stats.users.organisers /
												stats.users.total) *
												100
										)}
										%)
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Events Tab */}
			{activeTab === "events" && (
				<div>
					<div className="mb-6">
						<h2 className="text-xl font-semibold mb-3">
							Event Statistics
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="bg-white border rounded-lg p-4">
								<h3 className="font-medium mb-3">
									Event Status
								</h3>
								<div className="flex flex-col space-y-2">
									<div className="flex justify-between items-center">
										<span>Active</span>
										<span className="text-green-600 font-semibold">
											{stats.events.active}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span>Completed</span>
										<span className="text-blue-600 font-semibold">
											{stats.events.completed}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span>Cancelled</span>
										<span className="text-red-600 font-semibold">
											{stats.events.cancelled}
										</span>
									</div>
								</div>
							</div>
							<div className="bg-white border rounded-lg p-4">
								<h3 className="font-medium mb-3">
									Popular Causes
								</h3>
								<div className="space-y-2">
									{stats.events.popularCauses?.map(
										(cause, index) => (
											<div
												key={index}
												className="flex justify-between items-center"
											>
												<span>{cause._id}</span>
												<span className="font-semibold">
													{cause.count}
												</span>
											</div>
										)
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Reports Tab */}
			{activeTab === "reports" && (
				<div>
					<div className="mb-6">
						<h2 className="text-xl font-semibold mb-3">
							Report Statistics
						</h2>
						<div className="bg-white border rounded-lg overflow-hidden">
							<div className="p-4 grid grid-cols-3 gap-4">
								<div className="text-center">
									<p className="text-sm text-gray-500">
										Pending
									</p>
									<p className="text-2xl font-bold text-yellow-600">
										{stats.reports.pending}
									</p>
								</div>
								<div className="text-center">
									<p className="text-sm text-gray-500">
										Under Review
									</p>
									<p className="text-2xl font-bold text-blue-600">
										{stats.reports.under_review}
									</p>
								</div>
								<div className="text-center">
									<p className="text-sm text-gray-500">
										Resolved
									</p>
									<p className="text-2xl font-bold text-green-600">
										{stats.reports.resolved}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminDashboard;
