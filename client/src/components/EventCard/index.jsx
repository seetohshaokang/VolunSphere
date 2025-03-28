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
		<div className="card bg-base-100 shadow-xl h-full">
			<figure className="relative">
				<img
					src={`https://source.unsplash.com/random/300x200/?${
						event.cause || "volunteer"
					}`}
					alt={event.name || "Event"}
					className="h-48 w-full object-cover"
				/>
				<div className="absolute top-3 left-3">
					<span className="badge badge-ghost bg-white text-gray-800">
						{getSpots()} spots left
					</span>
				</div>
			</figure>

			<div className="card-body">
				<h2 className="card-title text-lg font-bold">{event.name}</h2>

				{event.organiser_id && (
					<p className="text-sm text-gray-500 flex items-center gap-2 mb-1">
						<i className="fas fa-user"></i>
						{event.organiser_id}
					</p>
				)}

				<p className="text-sm flex items-center gap-2 mb-1">
					<i className="fas fa-calendar text-primary"></i>
					{new Date(
						event.start_date || event.date
					).toLocaleDateString()}
				</p>

				<p className="text-sm flex items-center gap-2 mb-1">
					<i className="fas fa-map-marker-alt text-primary"></i>
					{event.location || "Various locations"}
				</p>

				{event.description && (
					<p className="text-sm truncate mb-4">{event.description}</p>
				)}

				<div className="card-actions justify-end mt-auto">
					<Link
						to={`/events/${event.id}`}
						className="btn btn-primary btn-block"
					>
						View Details
					</Link>
				</div>
			</div>
		</div>
	);
}

export default EventCard;
