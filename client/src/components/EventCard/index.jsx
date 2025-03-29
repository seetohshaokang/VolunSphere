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
		<Card className="h-full flex flex-col overflow-hidden">
			<div className="relative">
				<img
					src={"/src/assets/default-event.jpg"}
					alt={event.name || "Event"}
					className="h-48 w-full object-cover"
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
						{event.organiser_id}
					</p>
				)}

				<p className="text-sm flex items-center gap-2">
					<Calendar className="h-4 w-4 text-primary" />
					{new Date(
						event.start_date || event.date
					).toLocaleDateString()}
				</p>

				<p className="text-sm flex items-center gap-2">
					<MapPin className="h-4 w-4 text-primary" />
					{event.location || "Various locations"}
				</p>

				{event.description && (
					<p className="text-sm truncate mt-2">{event.description}</p>
				)}
			</CardContent>

			<CardFooter className="px-4 py-3 mt-auto">
				<Button asChild className="w-full">
					<Link to={`/events/${event.id}`}>View Details</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}

export default EventCard;
