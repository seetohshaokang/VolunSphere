// src/containers/Organizer/Dashboard/index.jsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ContentHeader from "../../../components/ContentHeader";
import { useAuth } from "../../../contexts/AuthContext";
import Api from "../../../helpers/Api";

function OrganizerDashboard() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchOrganizedEvents = async () => {
			try {
				setLoading(true);
				const response = await Api.getOrganizedEvents();

				// For demo purposes, using mock data
				// In production, use: const data = await response.json();
				const mockEvents = [
					{
						id: 1,
						name: "Beach Cleanup Drive",
						start_date: "2025-04-15",
						location: "Changi Beach",
						cause: "Environment",
						registered_count: 12,
						max_volunteers: 20,
						status: "active",
					},
					{
						id: 2,
						name: "Elderly Home Visit",
						start_date: "2025-04-22",
						location: "Sunshine Retirement Home",
						cause: "Healthcare",
						registered_count: 8,
						max_volunteers: 15,
						status: "active",
					},
					{
						id: 3,
						name: "Food Distribution Drive",
						start_date: "2025-04-10",
						location: "Central Community Center",
						cause: "Social Services",
						registered_count: 20,
						max_volunteers: 25,
						status: "completed",
					},
				];

				setEvents(mockEvents);
				setLoading(false);
			} catch (err) {
				console.error("Error fetching organized events:", err);
				setError("Failed to load your events. Please try again.");
				setLoading(false);
			}
		};

		fetchOrganizedEvents();
	}, []);

	return (
		<div className="container mx-auto px-4 py-6">
			<ContentHeader
				title="Organizer Dashboard"
				links={[
					{ to: "/", label: "Home" },
					{ label: "Dashboard", isActive: true },
				]}
			/>

			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold">
					Welcome back, {user?.name || "Organizer"}
				</h2>
				<Button onClick={() => navigate("/events/create")}>
					<Plus className="h-4 w-4 mr-2" /> Create New Event
				</Button>
			</div>

			{/* Stats overview */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<Card>
					<CardContent className="flex items-center p-6">
						<div className="bg-primary/10 p-3 rounded-full mr-4">
							<Calendar className="h-6 w-6 text-primary" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">
								Total Events
							</p>
							<h3 className="text-2xl font-bold">
								{events.length}
							</h3>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="flex items-center p-6">
						<div className="bg-primary/10 p-3 rounded-full mr-4">
							<Users className="h-6 w-6 text-primary" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">
								Total Volunteers
							</p>
							<h3 className="text-2xl font-bold">
								{events.reduce(
									(acc, event) =>
										acc + (event.registered_count || 0),
									0
								)}
							</h3>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="flex items-center p-6">
						<div className="bg-primary/10 p-3 rounded-full mr-4">
							<Clock className="h-6 w-6 text-primary" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">
								Upcoming Events
							</p>
							<h3 className="text-2xl font-bold">
								{
									events.filter((e) => e.status === "active")
										.length
								}
							</h3>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card className="mb-8">
				<CardHeader>
					<CardTitle>Your Events</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex justify-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
						</div>
					) : error ? (
						<div className="text-red-500 text-center py-6">
							{error}
						</div>
					) : events.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-muted-foreground mb-4">
								You haven't created any events yet.
							</p>
							<Button onClick={() => navigate("/events/create")}>
								<Plus className="h-4 w-4 mr-2" /> Create Your
								First Event
							</Button>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{events.map((event) => (
								<div
									key={event.id}
									className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
								>
									<div className="relative">
										<img
											src={
												"/src/assets/default-event.jpg"
											}
											alt={event.name}
											className="h-40 w-full object-cover"
										/>
										<div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-medium">
											{event.status === "active" ? (
												<span className="text-green-600">
													Active
												</span>
											) : event.status === "completed" ? (
												<span className="text-gray-600">
													Completed
												</span>
											) : (
												<span className="text-yellow-600">
													{event.status}
												</span>
											)}
										</div>
									</div>
									<div className="p-4">
										<h3 className="font-bold text-lg mb-2">
											{event.name}
										</h3>
										<div className="flex items-center text-sm text-gray-600 mb-1">
											<Calendar className="h-4 w-4 mr-1" />
											{new Date(
												event.start_date
											).toLocaleDateString()}
										</div>
										<div className="flex items-center text-sm text-gray-600 mb-1">
											<MapPin className="h-4 w-4 mr-1" />
											{event.location}
										</div>
										<div className="flex items-center text-sm text-gray-600 mb-3">
											<Users className="h-4 w-4 mr-1" />
											{event.registered_count || 0} /{" "}
											{event.max_volunteers} volunteers
										</div>
										<Link
											to={`/organizer/events/${event.id}`}
											className="block w-full bg-primary text-white text-center py-2 rounded-md hover:bg-primary/90 transition-colors"
										>
											Manage Event
										</Link>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default OrganizerDashboard;
