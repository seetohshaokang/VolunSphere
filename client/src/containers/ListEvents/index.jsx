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
			<section className="content">
				<div className="container-fluid">
					<div className="row">
						<div className="col-12">
							<div className="card">
								<div className="card-header">
									<h3 className="card-title">All Events</h3>
									<div className="card-tools">
										<Link
											to="/events/create"
											className="btn btn-primary btn-sm"
										>
											<i className="fas fa-plus"></i>{" "}
											Create New Event
										</Link>
									</div>
								</div>
								<div className="card-body table-responsive p-0">
									{loading ? (
										<div className="text-center p-4">
											Loading events...
										</div>
									) : error ? (
										<div className="alert alert-danger m-3">
											{error}
										</div>
									) : (
										<table className="table table-hover text-nowrap">
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
														<td>
															{event.location}
														</td>
														<td>
															{event.category}
														</td>
														<td>
															{event.registered} /{" "}
															{event.slots}
														</td>
														<td>
															<span
																className={`badge ${
																	event.status ===
																	"active"
																		? "bg-success"
																		: "bg-secondary"
																}`}
															>
																{event.status}
															</span>
														</td>
														<td>
															<Link
																to={`/events/edit/${event.id}`}
																className="btn btn-info btn-sm mr-2"
															>
																<i className="fas fa-edit"></i>
															</Link>
															<button
																className="btn btn-danger btn-sm"
																onClick={() =>
																	handleDelete(
																		event.id
																	)
																}
															>
																<i className="fas fa-trash"></i>
															</button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}

export default ListEvents;
