import React, { useEffect, useState } from "react";
import EventCard from "../../components/EventCard";
import FilterControls from "../../components/FilterControls";
import ResultsHeader from "../../components/ResultsHeader";
import { useAuth } from "../../contexts/AuthContext";
import Api from "../../helpers/Api";

function Home() {
	const { user } = useAuth();
	const [events, setEvents] = useState([]);
	const [filteredEvents, setFilteredEvents] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [filters, setFilters] = useState({
		category: "",
		location: "",
		priceRange: {
			min: 0,
			max: 1000,
		},
		dateRange: {
			start: "",
			end: "",
		},
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Fetch events from API
	useEffect(() => {
		const fetchEvents = async () => {
			try {
				setLoading(true);
				const data = await Api.getAllEvents().then((response) => {
					if (!response.ok) {
						throw new Error("Network response was not ok");
					}
					return response.json();
				});

				setEvents(data || []);
				setFilteredEvents(data || []);
				setError(null);
			} catch (error) {
				console.error("Error fetching events:", error);
				setError("Failed to load events.");
				setEvents([]);
				setFilteredEvents([]);
			} finally {
				setLoading(false);
			}
		};

		fetchEvents();
	}, []);

	// Extract unique categories and locations for filters
	const categories = [
		...new Set(events.map((event) => event.cause || "Other")),
	];
	const locations = [
		...new Set(events.map((event) => event.location || "Unknown")),
	];

	// Apply search and filters
	useEffect(() => {
		let results = events;

		// Apply search term
		if (searchTerm) {
			results = results.filter(
				(event) =>
					(event.name?.toLowerCase() || "").includes(
						searchTerm.toLowerCase()
					) ||
					(event.description?.toLowerCase() || "").includes(
						searchTerm.toLowerCase()
					)
			);
		}

		// Apply category filter
		if (filters.category) {
			results = results.filter(
				(event) => event.cause === filters.category
			);
		}

		// Apply location filter
		if (filters.location) {
			results = results.filter(
				(event) => event.location === filters.location
			);
		}

		// Apply price range filter
		if (
			typeof filters.priceRange.min === "number" &&
			typeof filters.priceRange.max === "number"
		) {
			results = results.filter((event) => {
				const price = event.price || 0;
				return (
					price >= filters.priceRange.min &&
					price <= filters.priceRange.max
				);
			});
		}

		// Apply date range filter
		if (filters.dateRange.start) {
			results = results.filter(
				(event) =>
					new Date(event.start_date || event.date) >=
					new Date(filters.dateRange.start)
			);
		}

		if (filters.dateRange.end) {
			results = results.filter(
				(event) =>
					new Date(event.end_date || event.date) <=
					new Date(filters.dateRange.end)
			);
		}

		setFilteredEvents(results);
	}, [searchTerm, filters, events]);

	// Handle search input change
	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value);
	};

	// Handle filter changes
	const handleFilterChange = (filterType, value) => {
		if (filterType === "priceMin" || filterType === "priceMax") {
			setFilters({
				...filters,
				priceRange: {
					...filters.priceRange,
					[filterType === "priceMin" ? "min" : "max"]:
						parseInt(value) || 0,
				},
			});
		} else if (filterType === "dateStart" || filterType === "dateEnd") {
			setFilters({
				...filters,
				dateRange: {
					...filters.dateRange,
					[filterType === "dateStart" ? "start" : "end"]: value,
				},
			});
		} else {
			setFilters({
				...filters,
				[filterType]: value,
			});
		}
	};

	// Reset all filters
	const resetFilters = () => {
		setSearchTerm("");
		setFilters({
			category: "",
			location: "",
			priceRange: {
				min: 0,
				max: 1000,
			},
			dateRange: {
				start: "",
				end: "",
			},
		});
	};

	return (
		<>
			<section className="content">
				<div className="container-fluid">
					{/* Combined Headline and Search with white background */}
					<div className="row mb-4">
						<div className="col-12">
							<div
								style={{
									background: "white",
									padding: "20px",
									borderRadius: "5px",
								}}
							>
								<div className="mb-4">
									<h2>Be a volunteer</h2>
									<p className="text-muted">
										Volunteerism is an enthralling, deeply
										humbling way to leave the world a better
										place than it was when you found it.
									</p>
								</div>

								{/* Search Bar embedded directly */}
								<div>
									<h5>Search opportunities</h5>
									<div className="input-group">
										<input
											type="text"
											className="form-control"
											placeholder="Search using keywords..."
											value={searchTerm}
											onChange={handleSearchChange}
										/>
										<button
											className="btn btn-outline-secondary"
											type="button"
											onClick={resetFilters}
										>
											Reset
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Filter Controls */}
					<FilterControls
						filters={filters}
						categories={categories}
						locations={locations}
						handleFilterChange={handleFilterChange}
					/>

					{/* Results Header */}
					<ResultsHeader eventCount={filteredEvents.length} />

					{/* Loading State */}
					{loading && (
						<div className="row">
							<div className="col-12 text-center py-4">
								<div
									className="spinner-border text-primary"
									role="status"
								>
									<span className="visually-hidden">
										Loading...
									</span>
								</div>
								<p className="mt-2">
									Loading volunteer opportunities...
								</p>
							</div>
						</div>
					)}

					{/* Error Message */}
					{error && (
						<div className="row">
							<div className="col-12">
								<div className="alert alert-warning">
									<i className="fas fa-exclamation-triangle me-2"></i>
									{error}
								</div>
							</div>
						</div>
					)}

					{/* Event Cards */}
					{!loading && (
						<div className="row">
							{filteredEvents.length > 0 ? (
								filteredEvents.map((event) => (
									<div
										className="col-md-4 mb-4"
										key={event.id}
									>
										<EventCard event={event} />
									</div>
								))
							) : (
								<div className="col-12">
									<div className="alert alert-info">
										<i className="fas fa-info-circle me-2"></i>
										No events match your search criteria.
										Please try different filters.
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</section>
		</>
	);
}

export default Home;
