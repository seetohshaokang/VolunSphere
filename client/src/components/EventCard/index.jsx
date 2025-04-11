// src/components/EventCard/index.jsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { Calendar, MapPin, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

function EventCard({ event }) {
	const navigate = useNavigate();

	// Default image if none provided
	const DEFAULT_IMAGE = "/src/assets/default-event.jpg";

	// Format image URL to use the full server URL if it's a relative path
	const getImageUrl = (imageUrl) => {
		if (!imageUrl) return DEFAULT_IMAGE;

		// If it already has http:// or https://, use it as is
		if (imageUrl.startsWith("http")) return imageUrl;

		// If it's a relative path from the server like /uploads/events/...
		// Prepend the server URL
		const serverUrl = "http://localhost:8000";
		if (imageUrl.startsWith("/uploads")) {
			return `${serverUrl}${imageUrl}`;
		}

		return DEFAULT_IMAGE;
	};

	// Get spots count based on max_volunteers property
	const getSpots = () => {
		if (event.max_volunteers) {
			const remainingSpots =
				event.max_volunteers - (event.registered_count || 0);
			return Math.max(0, remainingSpots); // Ensure we don't display negative spots
		}
		return "N/A";
	};

	// Handle card click
	const handleCardClick = () => {
		navigate(`/events/${event._id || event.id}`);
	};

	return (
		<Card
			className="h-full flex flex-col overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
			onClick={handleCardClick}
		>
			<div className="relative">
				<img
					crossOrigin="anonymous"
					src={getImageUrl(event.image_url)}
					alt={event.name || "Event"}
					className="h-48 w-full object-cover"
					onError={(e) => {
						e.target.onerror = null; // Prevent infinite loop if default image fails
						e.target.src = DEFAULT_IMAGE;
					}}
				/>
				<div className="absolute top-3 left-3">
					<Badge
						variant="secondary"
						className="bg-white text-gray-800"
					>
						{getSpots()} spots left
					</Badge>
				</div>
			</div>

			<CardHeader className="px-4 py-3">
				<h2 className="text-lg font-bold">{event.name}</h2>
			</CardHeader>

			<CardContent className="px-4 py-0 space-y-2 flex-grow">
				{event.organiser_id && (
					<p className="text-sm text-muted-foreground flex items-center gap-2">
						<User className="h-4 w-4" />
						{typeof event.organiser_id === "object"
							? event.organiser_id.name || "Event Organizer"
							: "Event Organizer"}
					</p>
				)}

				<p className="text-sm flex items-center gap-2">
					<Calendar className="h-4 w-4 text-primary" />
					{event.is_recurring && event.recurrence_start_date
						? new Date(
								event.recurrence_start_date
						  ).toLocaleDateString()
						: event.start_datetime
						? new Date(event.start_datetime).toLocaleDateString()
						: event.start_date
						? new Date(event.start_date).toLocaleDateString()
						: "Date TBD"}
				</p>

				<p className="text-sm flex items-center gap-2">
					<MapPin className="h-4 w-4 text-primary" />
					{event.location || "Various locations"}
				</p>

				{event.description && (
					<p className="text-sm line-clamp-2 mt-2">
						{event.description}
					</p>
				)}
			</CardContent>

			<CardFooter className="px-4 py-3 mt-auto">
				<Button
					className="w-full"
					onClick={(e) => {
						e.stopPropagation(); // Prevent card click from triggering
						navigate(`/events/${event._id || event.id}`);
					}}
				>
					View Details
				</Button>
			</CardFooter>
		</Card>
	);
}

export default EventCard;
