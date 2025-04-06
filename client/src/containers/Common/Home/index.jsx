// src/containers/Home/index.jsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import EventCard from "../../../components/EventCard";
import FilterControls from "../../../components/FilterControls";
import ResultsHeader from "../../../components/ResultsHeader";
import Searchbar from "../../../components/SearchBar";
import Api from "../../../helpers/Api";

function Home() {
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

	// Fetch all events initially
	useEffect(() => {
		fetchEvents();
		
		// Add event listener for when the page regains focus
		const handleFocus = () => {
			// Refresh the events when the user returns to this page
			// (e.g., after signup/removal from the event detail page)
			fetchEvents(searchTerm);
		};
		
		window.addEventListener('focus', handleFocus);
		
		// Clean up the event listener
		return () => {
			window.removeEventListener('focus', handleFocus);
		};
	}, []);

	// Fetch events from API
	const fetchEvents = async (searchQuery = "") => {
		setLoading(true);
		setError(null);
		
		try {
			// Construct the API URL with search parameter if provided
			let apiUrl = `${Api.SERVER_PREFIX}/events`;
			
			// Only add search parameter if searchQuery is not empty
			if (searchQuery && searchQuery.trim() !== "") {
				apiUrl += `?search=${encodeURIComponent(searchQuery.trim())}`;
			}
			
			const response = await fetch(apiUrl);
			
			if (!response.ok) {
				throw new Error(`API error with status: ${response.status}`);
			}
			
			const data = await response.json();
			
			// API might return either 'events' array or direct array
			const eventsData = data.events || data;
			
			// If no events found but didn't get an error, just set empty arrays
			if (!eventsData || eventsData.length === 0) {
				setEvents([]);
				setFilteredEvents([]);
			} else {
				setEvents(eventsData);
				setFilteredEvents(eventsData);
			}
		} catch (err) {
			console.error("Error fetching events:", err);
			// Don't show error for no results, just set empty arrays
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
		if (e.key === 'Enter') {
			handleSearchSubmit();
		}
	};

	// Apply client-side filters (category, location, date)
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
				(event.location || '').includes(filters.location)
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
	const categories = [...new Set(events.map((event) => event.cause).filter(Boolean))];
	const locations = [...new Set(events.map((event) => event.location).filter(Boolean))];

	return (
		<>
			<div className="min-h-screen flex flex-col">
				<div className="mb-6">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
						<h1 className="text-2xl font-bold mb-2 sm:mb-0 flex items-center">
							Find Volunteer Opportunities
						</h1>
					</div>
					<div className="h-px bg-border mt-2 mb-4"></div>
				</div>

				{/* Custom Search bar */}
				<div className="relative mb-6">
					<div className="flex w-full">
						<Input
							type="text"
							placeholder="Search for volunteer opportunities..."
							value={searchTerm}
							onChange={handleSearchInputChange}
							onKeyDown={handleKeyDown}
							className="rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12"
						/>
						<Button 
							className="rounded-l-none h-12 border border-input" 
							onClick={handleSearchSubmit}
						>
							<Search className="h-5 w-5 mr-2" />
							Search
						</Button>
					</div>
				</div>

				{/* Filter section */}
				<FilterControls
					filters={filters}
					categories={categories}
					locations={locations}
					handleFilterChange={handleFilterChange}
				/>

				{/* Results count */}
				<ResultsHeader eventCount={filteredEvents.length} />

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
								Try adjusting your search or filters to find
								more opportunities.
							</p>
						</CardContent>
					</Card>
				)}
			</div>
		</>
	);
}

export default Home;
