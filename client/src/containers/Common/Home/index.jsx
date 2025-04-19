// src/containers/Common/Home/index.jsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import EventCard from "../../../components/EventCard";
import FilterControls from "../../../components/FilterControls";
import ResultsHeader from "../../../components/ResultsHeader";
import Api from "../../../helpers/Api";

// Add custom focus styles for search inputs
const customInputStyles = `
	.search-input:focus {
		border-width: 2px;
		border-color: rgb(59 130 246); /* Tailwind blue-500 */
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
		border-right: none;
		outline: none;
	}
`;

function Home() {
	// Get the navigate function
	const navigate = useNavigate();
	
	// State management
	const [events, setEvents] = useState([]);
	const [filteredEvents, setFilteredEvents] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filters, setFilters] = useState({
		category: "all",
		location: "all",
		dateRange: {
			start: "",
			end: "",
		},
		priceRange: {
			min: 0,
			max: 1000,
		},
	});

	// Navigate to map view
	const handleMapViewClick = () => {
		navigate("/events/map");
	};

	// Fetch all events initially
	useEffect(() => {
		fetchEvents();

		// Add event listener for when the page regains focus
		const handleFocus = () => {
			// Refresh the events when the user returns to this page
			// (e.g., after signup/removal from the event detail page)
			fetchEvents(searchTerm);
		};
		
		// Add visibility change listener to refresh when tab becomes visible again
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				console.log('Page visibility changed to visible, refreshing events');
				fetchEvents(searchTerm);
			}
		};

		// Set up periodic refresh of events (every 30 seconds)
		const refreshInterval = setInterval(() => {
			if (document.visibilityState === 'visible') {
				console.log('Periodic refresh of events');
				fetchEvents(searchTerm);
			}
		}, 30000);

		window.addEventListener("focus", handleFocus);
		document.addEventListener("visibilitychange", handleVisibilityChange);

		// Clean up the event listeners and interval
		return () => {
			window.removeEventListener("focus", handleFocus);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			clearInterval(refreshInterval);
		};
	}, []);

	// Other existing functions: fetchEvents, handleSearchSubmit, handleInputChange, etc...
	// (Keeping the rest of your code the same)

	// Fetch events from API
	const fetchEvents = async (searchQuery = "") => {
		setLoading(true);
		setError(null);

		try {
			// Use the Api helper but with our improved handling
			let response;

			if (searchQuery && searchQuery.trim() !== "") {
				// If search term exists, construct a URL with the search parameter
				const apiUrl = `${
					Api.SERVER_PREFIX
				}/events?search=${encodeURIComponent(searchQuery.trim())}`;
				response = await fetch(apiUrl);
			} else {
				// Otherwise use the Api helper method
				response = await Api.getAllEvents();
			}

			if (!response.ok) {
				throw new Error(`API error with status: ${response.status}`);
			}

			const data = await response.json();
			console.log("Raw API response for events:", data);

			// Process the data as in the 2ad8cdb6 version
			const apiEvents = (data.events || []).map((event) => {
				console.log(`Event ${event._id} image_url:`, event.image_url);
				
				return {
					id: event._id,
					name: event.name,
					organiser_id: event.organiser_id?.name || "Unknown",
					start_date: event.start_datetime
						? event.start_datetime.split("T")[0]
						: "",
					location: event.location,
					description: event.description,
					cause: event.causes?.[0] || "General",
					max_volunteers: event.max_volunteers,
					registered_count: event.registered_count || 0,
					image_url: event.image_url || null,
					status: event.status || "active"
				};
			});

			console.log("Processed events with images:", apiEvents);
			setEvents(apiEvents);
			setFilteredEvents(apiEvents);
		} catch (err) {
			console.error("Error fetching events:", err);
			setError("Failed to load events. Please try again.");
			setEvents([]);
			setFilteredEvents([]);
		} finally {
			setLoading(false);
		}
	};

	// Handle search when search button is clicked
	const handleSearchSubmit = () => {
		fetchEvents(searchTerm);
	};

	// Handle input change for search
	const handleSearchInputChange = (e) => {
		const newSearchTerm = e.target.value;
		setSearchTerm(newSearchTerm);

		// If search is cleared completely, fetch all events immediately
		if (newSearchTerm.trim() === "") {
			fetchEvents("");
		}
	};

	// Handle Enter key press in search input
	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			handleSearchSubmit();
		}
	};

	// Filter events based on search term and filter settings
	useEffect(() => {
		if (events.length === 0) return;

		let results = [...events];

		// Apply category filter
		if (filters.category && filters.category !== "all") {
			results = results.filter(
				(event) => event.cause === filters.category
			);
		}

		// Apply location filter
		if (filters.location && filters.location !== "all") {
			results = results.filter((event) =>
				(event.location || "").includes(filters.location)
			);
		}

		// Apply date filters
		if (filters.dateRange.start) {
			results = results.filter(
				(event) =>
					new Date(event.start_date) >=
					new Date(filters.dateRange.start)
			);
		}

		if (filters.dateRange.end) {
			results = results.filter(
				(event) =>
					new Date(event.start_date) <=
					new Date(filters.dateRange.end)
			);
		}

		setFilteredEvents(results);
	}, [filters, events]);

	// Handle filter changes
	const handleFilterChange = (filterName, value) => {
		setFilters((prevFilters) => {
			const newFilters = { ...prevFilters };

			switch (filterName) {
				case "category":
					newFilters.category = value;
					break;
				case "location":
					newFilters.location = value;
					break;
				case "dateStart":
					newFilters.dateRange.start = value;
					break;
				case "dateEnd":
					newFilters.dateRange.end = value;
					break;
				case "priceMin":
					newFilters.priceRange.min = value;
					break;
				case "priceMax":
					newFilters.priceRange.max = value;
					break;
				default:
					break;
			}

			return newFilters;
		});
	};

	// Get unique categories and locations for filter options
	const categories = [
		...new Set(events.map((event) => event.cause).filter(Boolean)),
	];
	const locations = [
		...new Set(events.map((event) => event.location).filter(Boolean)),
	];

	return (
		<div className="min-h-screen flex flex-col">
			{/* Add style tag for custom search input styles */}
			<style>{customInputStyles}</style>
			
			<div className="mb-4">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
					<h1 className="text-2xl font-bold mb-2 sm:mb-0 flex items-center">
						Find Volunteer Opportunities
					</h1>
                    
                    {/* Add the map view button here */}
                    <Button 
                        onClick={handleMapViewClick}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                    >
                        <MapPin className="h-4 w-4" />
                        <span>View Events on Map</span>
                    </Button>
				</div>
				<div className="h-px bg-border mt-2"></div>
			</div>

			{/* Search and filter section */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				{/* Custom Search bar */}
				<div className="relative md:col-span-4">
					<div className="flex w-full">
						<Input
							type="text"
							placeholder="Search for volunteer opportunities..."
							value={searchTerm}
							onChange={handleSearchInputChange}
							onKeyDown={handleKeyDown}
							className="rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 search-input transition-all duration-200"
						/>
						<Button
							variant="outline"
							onClick={handleSearchSubmit}
							className="rounded-l-none h-12"
						>
							<Search className="h-5 w-5 mr-2" />
							Search
						</Button>
					</div>
				</div>

				{/* Filter section */}
				<div className="md:col-span-4">
					<FilterControls
						filters={filters}
						categories={categories}
						locations={locations}
						handleFilterChange={handleFilterChange}
					/>
				</div>
			</div>

			{/* Results count */}
			<ResultsHeader eventCount={filteredEvents.length} />

			{/* Error message */}
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
					{error}
				</div>
			)}

			{/* Event cards grid */}
			{loading ? (
				<div className="flex justify-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
				</div>
			) : filteredEvents.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredEvents.map((event) => (
						<EventCard key={event.id} event={event} />
					))}
				</div>
			) : (
				<Card>
					<CardContent className="py-12 text-center">
						<h2 className="text-xl font-semibold">
							No events found
						</h2>
						<p className="text-muted-foreground mt-2">
							Try adjusting your search or filters to find more
							opportunities.
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

export default Home;