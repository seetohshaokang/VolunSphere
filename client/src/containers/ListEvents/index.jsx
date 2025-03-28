import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ContentHeader from "../../components/ContentHeader";

function ListEvents() {
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		// Fetch events from API
		fetchEvents();
	}, []);

	const fetchEvents = async () => {
		setLoading(true);
		try {
			// In a real implementation, use your Api helper
			// const response = await Api.getAllEvents();
			// const data = await response.json();

			// Simulating API call with sample data for now
			const data = [
				{
					id: 1,
					title: "Beach Cleanup",
					date: "2025-04-15",
					location: "Miami Beach",
					category: "Environment",
					slots: 15,
					registered: 8,
					status: "active",
				},
				{
					id: 2,
					title: "Food Bank Assistance",
					date: "2025-03-20",
					location: "Downtown Community Center",
					category: "Social Services",
					slots: 10,
					registered: 6,
					status: "active",
				},
				{
					id: 3,
					title: "Senior Home Visit",
					date: "2025-05-05",
					location: "Sunshine Retirement Home",
					category: "Healthcare",
					slots: 8,
					registered: 3,
					status: "active",
				},
			];

			setEvents(data);
			setLoading(false);
		} catch (err) {
			console.error("Error fetching events:", err);
			setError("Failed to load events. Please try again later.");
			setLoading(false);
		}
	};

	const handleDelete = (eventId) => {
		if (window.confirm("Are you sure you want to delete this event?")) {
			// In real implementation, use your Api helper
			// Api.deleteEvent(eventId).then(() => {
			//   fetchEvents();
			// });

			// For now, just filter out the event
			setEvents(events.filter((event) => event.id !== eventId));
		}
	};

	return (
		<>
			<ContentHeader
				title="Manage Events"
				links={[
					{ to: "/", label: "Home" },
					{ label: "Events", isActive: true },
				]}
			/>

			<div className="card bg-base-100 shadow-xl">
				<div className="card-body">
					<div className="flex justify-between items-center mb-6">
						<h2 className="card-title text-xl">All Events</h2>
						<Link
							to="/events/create"
							className="btn btn-primary btn-sm"
						>
							<i className="fas fa-plus mr-2"></i> Create New
							Event
						</Link>
					</div>

					{loading ? (
						<div className="flex justify-center py-8">
							<div className="loading loading-spinner loading-lg text-primary"></div>
						</div>
					) : error ? (
						<div className="alert alert-error">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="stroke-current shrink-0 h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span>{error}</span>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="table table-zebra w-full">
								<thead>
									<tr>
										<th>Title</th>
										<th>Date</th>
										<th>Location</th>
										<th>Category</th>
										<th>Slots</th>
										<th>Status</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{events.map((event) => (
										<tr key={event.id}>
											<td>{event.title}</td>
											<td>
												{new Date(
													event.date
												).toLocaleDateString()}
											</td>
											<td>{event.location}</td>
											<td>{event.category}</td>
											<td>
												{event.registered} /{" "}
												{event.slots}
											</td>
											<td>
												<span
													className={`badge ${
														event.status ===
														"active"
															? "badge-success"
															: "badge-ghost"
													}`}
												>
													{event.status}
												</span>
											</td>
											<td>
												<div className="flex gap-2">
													<Link
														to={`/events/edit/${event.id}`}
														className="btn btn-info btn-xs"
													>
														<i className="fas fa-edit"></i>
													</Link>
													<button
														className="btn btn-error btn-xs"
														onClick={() =>
															handleDelete(
																event.id
															)
														}
													>
														<i className="fas fa-trash"></i>
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</>
	);
}

export default ListEvents;
