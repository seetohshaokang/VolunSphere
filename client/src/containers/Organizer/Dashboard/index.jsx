// src/containers/Organizer/Dashboard/index.jsx
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	AlertCircle,
	Calendar,
	Clock,
	MapPin,
	Plus,
	Search,
	SlidersHorizontal,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ContentHeader from "../../../components/ContentHeader";
import { useAuth } from "../../../contexts/AuthContext";
import Api from "../../../helpers/Api";

function OrganizerDashboard() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [events, setEvents] = useState([]);
	const [filteredEvents, setFilteredEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [authError, setAuthError] = useState(false);
	const [showFilters, setShowFilters] = useState(false);

	// Filtering and sorting states
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [sortOption, setSortOption] = useState("newest");
	const [dateFilter, setDateFilter] = useState("all");
	const [isVerified, setIsVerified] = useState(false);

	useEffect(() => {
		fetchOrganizedEvents();
		checkVerificationStatus();
	}, []);

	// Apply filters and sorting whenever the filter criteria change
	useEffect(() => {
		if (events.length > 0) {
			applyFiltersAndSort();
		}
	}, [events, searchTerm, statusFilter, sortOption, dateFilter]);

	const fetchOrganizedEvents = async () => {
		try {
			setLoading(true);
			const response = await Api.getOrganizedEvents();

			// Check if response is OK
			if (!response.ok) {
				// Handle different error status codes
				if (response.status === 401) {
					console.error(
						"Authentication error: Token may be invalid or expired"
					);
					setAuthError(true);
					return;
				}

				throw new Error(`API error: ${response.status}`);
			}

			// Parse the response data
			const data = await response.json();
			console.log("Fetched events:", data);

			// Ensure events is an array (handle different API response formats)
			let eventsList = [];
			if (Array.isArray(data)) {
				eventsList = data;
			} else if (data.events && Array.isArray(data.events)) {
				eventsList = data.events;
			} else if (typeof data === "object") {
				// If it's some other object structure, initialize as empty array
				console.warn("Unexpected API response format:", data);
				eventsList = [];
			}

			setEvents(eventsList);
			// Default sort by newest
			const sortedEvents = [...eventsList].sort(
				(a, b) =>
					new Date(b.created_at || b.start_datetime || 0) -
					new Date(a.created_at || a.start_datetime || 0)
			);
			setFilteredEvents(sortedEvents);
			setLoading(false);
		} catch (err) {
			console.error("Error fetching organized events:", err);
			setError("Failed to load your events. Please try again.");
			setLoading(false);
			setEvents([]); // Initialize as empty array on error
			setFilteredEvents([]);
		}
	};

	// Function to apply filters and sorting
	const applyFiltersAndSort = () => {
		let result = [...events];

		// Apply search filter
		if (searchTerm) {
			const searchLower = searchTerm.toLowerCase();
			result = result.filter(
				(event) =>
					(event.name &&
						event.name.toLowerCase().includes(searchLower)) ||
					(event.description &&
						event.description
							.toLowerCase()
							.includes(searchLower)) ||
					(event.location &&
						event.location.toLowerCase().includes(searchLower))
			);
		}

		// Apply status filter
		if (statusFilter !== "all") {
			result = result.filter((event) => event.status === statusFilter);
		}

		// Apply date filter
		if (dateFilter !== "all") {
			const now = new Date();
			if (dateFilter === "upcoming") {
				result = result.filter((event) => {
					const eventDate = event.start_datetime
						? new Date(event.start_datetime)
						: event.recurrence_start_date
						? new Date(event.recurrence_start_date)
						: null;
					return eventDate && eventDate > now;
				});
			} else if (dateFilter === "past") {
				result = result.filter((event) => {
					const eventDate = event.end_datetime
						? new Date(event.end_datetime)
						: event.recurrence_end_date
						? new Date(event.recurrence_end_date)
						: event.start_datetime
						? new Date(event.start_datetime)
						: event.recurrence_start_date
						? new Date(event.recurrence_start_date)
						: null;
					return eventDate && eventDate < now;
				});
			}
		}

		// Apply sorting
		switch (sortOption) {
			case "newest":
				result.sort(
					(a, b) =>
						new Date(b.created_at || b.start_datetime || 0) -
						new Date(a.created_at || a.start_datetime || 0)
				);
				break;
			case "oldest":
				result.sort(
					(a, b) =>
						new Date(a.created_at || a.start_datetime || 0) -
						new Date(b.created_at || b.start_datetime || 0)
				);
				break;
			case "name-asc":
				result.sort((a, b) => a.name.localeCompare(b.name));
				break;
			case "name-desc":
				result.sort((a, b) => b.name.localeCompare(a.name));
				break;
			case "volunteers-high":
				result.sort(
					(a, b) =>
						(b.registered_count || 0) - (a.registered_count || 0)
				);
				break;
			case "volunteers-low":
				result.sort(
					(a, b) =>
						(a.registered_count || 0) - (b.registered_count || 0)
				);
				break;
			default:
				// Default to newest
				result.sort(
					(a, b) =>
						new Date(b.created_at || b.start_datetime || 0) -
						new Date(a.created_at || a.start_datetime || 0)
				);
		}

		setFilteredEvents(result);
	};

	// Function to reset filters
	const resetFilters = () => {
		setSearchTerm("");
		setStatusFilter("all");
		setDateFilter("all");
		setSortOption("newest");
	};

	// Function to handle card click
	const handleCardClick = (eventId) => {
		navigate(`/organizer/events/${eventId}`);
	};

	// Get date string for display
	const getEventDate = (event) => {
		if (event.is_recurring && event.recurrence_start_date) {
			return new Date(event.recurrence_start_date).toLocaleDateString();
		} else if (event.start_datetime) {
			return new Date(event.start_datetime).toLocaleDateString();
		} else if (event.start_date) {
			return new Date(event.start_date).toLocaleDateString();
		}
		return "Date TBD";
	};

	// If auth error, show a message with login button
	if (authError) {
		return (
			<div className="container mx-auto px-4 py-6">
				<ContentHeader
					title="Authentication Error"
					links={[
						{ to: "/", label: "Home" },
						{ label: "Dashboard", isActive: true },
					]}
				/>

				<Alert variant="destructive" className="mb-6">
					<AlertCircle className="h-4 w-4 mr-2" />
					<AlertDescription>
						Your session has expired or you don't have permission to
						view this page.
					</AlertDescription>
				</Alert>

				<div className="flex gap-4 justify-center">
					<Button variant="outline" onClick={() => navigate("/")}>
						Go to Home
					</Button>
					<Button
						onClick={() => {
							logout();
							navigate("/login");
						}}
					>
						Log in Again
					</Button>
				</div>
			</div>
		);
	}

	const checkVerificationStatus = async () => {
		try {
			const response = await Api.getUserProfile();
			if (response.ok) {
				const data = await response.json();
				// Check if organizer profile is verified
				if (
					data.profile &&
					data.profile.verification_status === "verified"
				) {
					setIsVerified(true);
				} else {
					setIsVerified(false);
				}
			}
		} catch (err) {
			console.error("Error checking verification status:", err);
			setIsVerified(false);
		}
	};

	const handleCreateEventClick = () => {
		navigate("/events/create");
	};

	// Calculate total volunteers with defensive check
	const totalVolunteers = Array.isArray(events)
		? events.reduce((acc, event) => acc + (event.registered_count || 0), 0)
		: 0;

	// Calculate active events with defensive check
	const activeEvents = Array.isArray(events)
		? events.filter((e) => e.status === "active").length
		: 0;

	return (
		<div className="container mx-auto px-4 py-6">
			<ContentHeader
				title="Organizer Dashboard"
				links={[
					{ to: "/organizer", label: "Home" },
					{ label: "Dashboard", isActive: true },
				]}
			/>

			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold">
					Welcome back, {user?.name || "Organizer"}
				</h2>
				<Button
					onClick={() => navigate("/events/create")}
					className="border-2 border-black"
				>
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
								{Array.isArray(events) ? events.length : 0}
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
								{totalVolunteers}
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
								{activeEvents}
							</h3>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card className="mb-8">
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle>Your Events</CardTitle>
					<div className="flex space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setShowFilters(!showFilters)}
						>
							<SlidersHorizontal className="h-4 w-4 mr-2" />
							{showFilters ? "Hide Filters" : "Show Filters"}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{/* Search and filters section */}
					<div className={`mb-6 ${showFilters ? "block" : "hidden"}`}>
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
							{/* Search */}
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<Input
									placeholder="Search events..."
									value={searchTerm}
									onChange={(e) =>
										setSearchTerm(e.target.value)
									}
									className="pl-10"
								/>
							</div>

							{/* Status filter */}
							<div>
								<Select
									value={statusFilter}
									onValueChange={setStatusFilter}
								>
									<SelectTrigger>
										<SelectValue placeholder="Filter by status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											All Statuses
										</SelectItem>
										<SelectItem value="active">
											Active
										</SelectItem>
										<SelectItem value="completed">
											Completed
										</SelectItem>
										<SelectItem value="cancelled">
											Cancelled
										</SelectItem>
										<SelectItem value="draft">
											Draft
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Date filter */}
							<div>
								<Select
									value={dateFilter}
									onValueChange={setDateFilter}
								>
									<SelectTrigger>
										<SelectValue placeholder="Filter by date" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											All Dates
										</SelectItem>
										<SelectItem value="upcoming">
											Upcoming Events
										</SelectItem>
										<SelectItem value="past">
											Past Events
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Sort options */}
							<div>
								<Select
									value={sortOption}
									onValueChange={setSortOption}
								>
									<SelectTrigger>
										<SelectValue placeholder="Sort by" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="newest">
											Newest First
										</SelectItem>
										<SelectItem value="oldest">
											Oldest First
										</SelectItem>
										<SelectItem value="name-asc">
											Name (A-Z)
										</SelectItem>
										<SelectItem value="name-desc">
											Name (Z-A)
										</SelectItem>
										<SelectItem value="volunteers-high">
											Most Volunteers
										</SelectItem>
										<SelectItem value="volunteers-low">
											Fewest Volunteers
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Filter info and reset button */}
						<div className="flex justify-between items-center">
							<p className="text-sm text-muted-foreground">
								Showing {filteredEvents.length} of{" "}
								{events.length} events
							</p>
							<Button
								variant="ghost"
								size="sm"
								onClick={resetFilters}
								disabled={
									!searchTerm &&
									statusFilter === "all" &&
									dateFilter === "all" &&
									sortOption === "newest"
								}
							>
								Reset Filters
							</Button>
						</div>
					</div>

					{loading ? (
						<div className="flex justify-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
						</div>
					) : error ? (
						<div className="text-red-500 text-center py-6">
							{error}
						</div>
					) : !Array.isArray(filteredEvents) ||
					  filteredEvents.length === 0 ? (
						<div className="text-center py-12">
							{events.length > 0 ? (
								<p className="text-muted-foreground mb-4">
									No events match your filters. Try adjusting
									your search criteria.
								</p>
							) : (
								<p className="text-muted-foreground mb-4">
									You haven't created any events yet.
								</p>
							)}
							<Button
								onClick={() => navigate("/events/create")}
								className="border-2 border-black"
							>
								<Plus className="h-4 w-4 mr-2" /> Create Your
								First Event
							</Button>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredEvents.map((event) => (
								<div
									key={event._id || event.id}
									className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
									onClick={() =>
										handleCardClick(event._id || event.id)
									}
								>
									<div className="relative">
										<img
											src={
												event.image_url ||
												"/src/assets/default-event.jpg"
											}
											alt={event.name}
											className="h-40 w-full object-cover"
											onError={(e) => {
												e.target.onerror = null;
												e.target.src =
													"/src/assets/default-event.jpg";
											}}
										/>
									</div>
									<div className="p-4">
										<div className="flex flex-col mb-2">
											<h3 className="font-bold text-lg">
												{event.name}
											</h3>

											{/* Add the status badge here, under the title */}
											<div className="mt-1">
												{event.status === "active" ? (
													<Badge className="bg-green-500 text-white font-medium">
														Active
													</Badge>
												) : event.status ===
												  "completed" ? (
													<Badge className="bg-blue-500 text-white font-medium">
														Completed
													</Badge>
												) : event.status === "draft" ? (
													<Badge className="bg-yellow-500 text-white font-medium">
														Draft
													</Badge>
												) : (
													<Badge className="bg-red-500 text-white font-medium">
														{event.status}
													</Badge>
												)}
											</div>
										</div>

										<div className="flex items-center text-sm text-gray-600 mb-1">
											<Calendar className="h-4 w-4 mr-1" />
											{getEventDate(event)}
										</div>
										<div className="flex items-center text-sm text-gray-600 mb-1">
											<MapPin className="h-4 w-4 mr-1" />
											{event.location ||
												"Location not specified"}
										</div>
										<div className="flex items-center text-sm text-gray-600 mb-3">
											<Users className="h-4 w-4 mr-1" />
											{event.registered_count || 0} /{" "}
											{event.max_volunteers || 0}{" "}
											volunteers
										</div>

										{/* Additional info like tags/causes */}
										{event.causes &&
											event.causes.length > 0 && (
												<div className="mb-3 flex flex-wrap gap-1">
													{event.causes.map(
														(cause, idx) => (
															<Badge
																key={idx}
																variant="secondary"
																className="text-xs"
															>
																{cause}
															</Badge>
														)
													)}
												</div>
											)}

										<Button
											className="w-full"
											onClick={(e) => {
												e.stopPropagation(); // Prevent triggering the card click
												navigate(
													`/organizer/events/${
														event._id || event.id
													}`
												);
											}}
										>
											Manage Event
										</Button>
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
