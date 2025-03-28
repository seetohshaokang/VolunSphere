// src/containers/Home/index.jsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import EventCard from "../../components/EventCard";
import FilterControls from "../../components/FilterControls";
import ResultsHeader from "../../components/ResultsHeader";

function Home() {
	// State management
	const [events, setEvents] = useState([]);
	const [filteredEvents, setFilteredEvents] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
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

	// Mock data - replace with API call
	useEffect(() => {
		// Simulate API call
		setTimeout(() => {
			const mockEvents = [
				{
					id: 1,
					name: "Beach Cleanup Drive",
					organiser_id: "ECO Guardians",
					start_date: "2025-04-15",
					location: "Changi Beach",
					description:
						"Join us for a community beach cleanup event. Help keep our beaches clean!",
					cause: "Environment",
					max_volunteers: 20,
				},
				{
					id: 2,
					name: "Elderly Home Visit",
					organiser_id: "Silver Care Society",
					start_date: "2025-04-22",
					location: "Sunshine Retirement Home",
					description:
						"Spend a day brightening the lives of elderly residents through companionship and activities.",
					cause: "Healthcare",
					max_volunteers: 15,
				},
				{
					id: 3,
					name: "Food Distribution Drive",
					organiser_id: "Hunger Heroes",
					start_date: "2025-04-10",
					location: "Central Community Center",
					description:
						"Help pack and distribute food packages to families in need in our community.",
					cause: "Social Services",
					max_volunteers: 25,
				},
				{
					id: 4,
					name: "Tree Planting Initiative",
					organiser_id: "Green Earth Alliance",
					start_date: "2025-05-05",
					location: "City Park",
					description:
						"Be part of our city's greening efforts by planting trees in local parks.",
					cause: "Environment",
					max_volunteers: 30,
				},
				{
					id: 5,
					name: "Animal Shelter Support",
					organiser_id: "Paws & Care",
					start_date: "2025-04-18",
					location: "Happy Tails Shelter",
					description:
						"Help walk, groom, and care for shelter animals awaiting their forever homes.",
					cause: "Animal Welfare",
					max_volunteers: 12,
				},
				{
					id: 6,
					name: "Literacy Program",
					organiser_id: "Education Matters",
					start_date: "2025-04-25",
					location: "Public Library",
					description:
						"Volunteer to read with children and support literacy skills development.",
					cause: "Education",
					max_volunteers: 10,
				},
			];

			setEvents(mockEvents);
			setFilteredEvents(mockEvents);
			setLoading(false);
		}, 1000);
	}, []);

	// Filter events based on search term and filter settings
	useEffect(() => {
		if (events.length === 0) return;

		let results = [...events];

		// Apply search filter
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			results = results.filter(
				(event) =>
					event.name.toLowerCase().includes(term) ||
					event.description.toLowerCase().includes(term) ||
					event.location.toLowerCase().includes(term) ||
					event.cause.toLowerCase().includes(term)
			);
		}

		// Apply category filter
		if (filters.category && filters.category !== "all") {
			results = results.filter(
				(event) => event.cause === filters.category
			);
		}

		// Apply location filter
		if (filters.location && filters.location !== "all") {
			results = results.filter((event) =>
				event.location.includes(filters.location)
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
	}, [searchTerm, filters, events]);

	// Handle search input
	const handleSearch = (e) => {
		setSearchTerm(e.target.value);
	};

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
	const categories = [...new Set(events.map((event) => event.cause))];
	const locations = [...new Set(events.map((event) => event.location))];

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

				{/* Search bar */}
				<Card className="mb-6">
					<CardContent className="p-4">
						<div className="flex w-full items-center space-x-2">
							<Input
								type="text"
								placeholder="Search for volunteer opportunities..."
								value={searchTerm}
								onChange={handleSearch}
								className="flex-grow"
							/>
							<Button type="submit">
								<Search className="h-4 w-4 mr-2" />
								Search
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Filter section */}
				<FilterControls
					filters={filters}
					categories={categories}
					locations={locations}
					handleFilterChange={handleFilterChange}
				/>

				{/* Results count */}
				<ResultsHeader eventCount={filteredEvents.length} />

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
