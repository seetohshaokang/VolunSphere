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
import { useState, useEffect } from "react";
import { getEventImageUrl, getRemainingSpots, getFormattedEventDate } from "../../helpers/eventHelper";

function EventCard({ event }) {
	const navigate = useNavigate();
	// Add timestamp for cache busting
	const [imageTimestamp, setImageTimestamp] = useState(Date.now());
	
	// Update timestamp when event changes or component mounts
	useEffect(() => {
		// Force refresh timestamp every time
		setImageTimestamp(Date.now());
		
		// Set up an interval to refresh the timestamp periodically (every 5 seconds)
		// This helps ensure the image is always fresh
		const intervalId = setInterval(() => {
			setImageTimestamp(Date.now());
		}, 5000);
		
		return () => clearInterval(intervalId);
	}, [event]);

	// Default image if none provided
	const DEFAULT_IMAGE = "/src/assets/default-event.jpg";

	// Handle card click
	const handleCardClick = () => {
		navigate(`/events/${event._id || event.id}`);
	};
	
	// Handle any load or error issues with images
	const handleImageError = (e) => {
		console.error("Error loading event image:", event.image_url);
		e.target.onerror = null; // Prevent infinite loop
		e.target.src = DEFAULT_IMAGE;
	};

	return (
		<Card
			className="h-full flex flex-col overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
			onClick={handleCardClick}
		>
			<div className="relative">
				<img
					crossOrigin="anonymous"
					src={getEventImageUrl(event.image_url, imageTimestamp)}
					alt={event.name || "Event"}
					className="h-48 w-full object-cover"
					onError={handleImageError}
				/>
				<div className="absolute top-3 left-3">
					<Badge
						variant="secondary"
						className="bg-white text-gray-800"
					>
						{getRemainingSpots(event.max_volunteers, event.registered_count)} spots left
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
					{getFormattedEventDate(event)}
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
