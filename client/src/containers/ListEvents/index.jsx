// src/containers/ListEvents/index.jsx
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { AlertCircle, Edit, Plus, Search, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ContentHeader from "../../components/ContentHeader";
import Api from "../../helpers/Api";

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
			// Using the API helper to fetch events
			const response = await Api.getAllEvents();
			const data = await response.json();

			setEvents(data);
			setLoading(false);
		} catch (err) {
			console.error("Error fetching events:", err);
			setError("Failed to load events. Please try again later.");
			setLoading(false);
		}
	};

	const handleDelete = async (eventId) => {
		if (window.confirm("Are you sure you want to delete this event?")) {
			try {
				await Api.deleteEvent(eventId);
				// Refresh the events list
				fetchEvents();
			} catch (err) {
				console.error("Error deleting event:", err);
				setError("Failed to delete event. Please try again.");
			}
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

			<Card>
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="text-xl">All Events</CardTitle>
					<Button asChild size="sm">
						<Link to="/events/create">
							<Plus className="h-4 w-4 mr-2" /> Create New Event
						</Link>
					</Button>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex justify-center py-8">
							<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
						</div>
					) : error ? (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					) : events.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-muted-foreground">
								No events found. Create your first event!
							</p>
						</div>
					) : (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Title</TableHead>
										<TableHead>Date</TableHead>
										<TableHead>Location</TableHead>
										<TableHead>Category</TableHead>
										<TableHead>Slots</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{events.map((event) => (
										<TableRow key={event.id}>
											<TableCell className="font-medium">
												{event.name || event.title}
											</TableCell>
											<TableCell>
												{new Date(
													event.start_date ||
														event.date
												).toLocaleDateString()}
											</TableCell>
											<TableCell>
												{event.location}
											</TableCell>
											<TableCell>
												{event.cause || event.category}
											</TableCell>
											<TableCell>
												{event.registered || 0} /{" "}
												{event.max_volunteers ||
													event.slots ||
													0}
											</TableCell>
											<TableCell>
												<Badge
													variant={
														event.status ===
														"active"
															? "default"
															: "secondary"
													}
												>
													{event.status || "active"}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="flex gap-2">
													<Button
														variant="outline"
														size="icon"
														asChild
													>
														<Link
															to={`/events/${event.id}`}
														>
															<Search className="h-4 w-4" />
														</Link>
													</Button>
													<Button
														variant="outline"
														size="icon"
														asChild
													>
														<Link
															to={`/events/edit/${event.id}`}
														>
															<Edit className="h-4 w-4" />
														</Link>
													</Button>
													<Button
														variant="outline"
														size="icon"
														onClick={() =>
															handleDelete(
																event.id
															)
														}
													>
														<Trash className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</>
	);
}

export default ListEvents;
