// src/containers/Home/components/EventCard.jsx
import React from "react";
import { Link } from "react-router-dom";

function EventCard({ event }) {
	// Get spots count based on max_volunteers property or a random number
	const getSpots = () => {
		if (event.max_volunteers) {
			return Math.min(
				Math.floor(Math.random() * event.max_volunteers) + 1,
				event.max_volunteers
			);
		}
		return Math.floor(Math.random() * 10) + 1;
	};

	return (
		<div className="card h-100">
			<div className="position-relative">
				<img
					src={`https://source.unsplash.com/random/300x200/?${
						event.cause || "volunteer"
					}`}
					className="card-img-top"
					alt={event.name || "Event"}
					style={{ height: "200px", objectFit: "cover" }}
				/>
				<div
					className="position-absolute"
					style={{ top: "10px", left: "10px" }}
				>
					<span className="badge bg-light text-dark">
						{getSpots()} spots left
					</span>
				</div>
			</div>
			<div className="card-body">
				<h5 className="card-title">{event.name}</h5>
				{event.organiser_id && (
					<p className="card-text text-muted mb-2">
						<i className="fas fa-user me-2"></i>
						{event.organiser_id}
					</p>
				)}
				<p className="card-text mb-2">
					<i className="fas fa-calendar me-2"></i>
					{new Date(
						event.start_date || event.date
					).toLocaleDateString()}
				</p>
				<p className="card-text mb-2">
					<i className="fas fa-map-marker-alt me-2"></i>
					{event.location || "Various locations"}
				</p>
				{event.description && (
					<p className="card-text text-truncate">
						{event.description}
					</p>
				)}
			</div>
			<div className="card-footer bg-white border-top-0">
				<Link
					to={`/events/${event.id}`}
					className="btn btn-primary w-100"
				>
					View Details
				</Link>
			</div>
		</div>
	);
}

export default EventCard;
