import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Basically landing page for non logged in users
function Home() {
    // Sample event data - replace with API call in production
    const [events, setEvents] = useState([
        {
            id: 1,
            title: "Tech Conference 2025",
            date: "2025-03-15",
            location: "San Francisco, CA",
            category: "Technology",
            price: 299,
            description: "Annual tech conference featuring the latest innovations."
        },
        {
            id: 2,
            title: "Summer Music Festival",
            date: "2025-07-10",
            location: "Austin, TX",
            category: "Music",
            price: 150,
            description: "Three days of live music across multiple stages."
        },
        {
            id: 3,
            title: "Business Leadership Summit",
            date: "2025-04-22",
            location: "Chicago, IL",
            category: "Business",
            price: 450,
            description: "Connect with industry leaders and enhance your leadership skills."
        },
        {
            id: 4,
            title: "Culinary Expo",
            date: "2025-05-08",
            location: "New York, NY",
            category: "Food",
            price: 75,
            description: "Explore culinary innovations from top chefs around the world."
        },
        {
            id: 5,
            title: "Web Developer Bootcamp",
            date: "2025-06-12",
            location: "Seattle, WA",
            category: "Technology",
            price: 199,
            description: "Intensive three-day workshop for web developers."
        }
    ]);

    // **API call to fetch events once we have a backend
    // useEffect(() => {
    //     // Fetch all public events
    //     // This API endpoint would be the same for all users
    //     fetch('/api/events/public')
    //       .then(res => res.json())
    //       .then(data => setEvents(data))
    //       .catch(err => console.error('Error fetching events:', err));
    //   }, []);

    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        location: '',
        priceRange: {
            min: 0,
            max: 1000
        },
        dateRange: {
            start: '',
            end: ''
        }
    });

    const categories = [...new Set(events.map(event => event.category))];
    const locations = [...new Set(events.map(event => event.location))];

    // Apply search and filters
    useEffect(() => {
        let results = events;

        // Apply search term
        if (searchTerm) {
            results = results.filter(event =>
                event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        if (filters.category) {
            results = results.filter(event => event.category === filters.category);
        }

        // Apply location filter
        if (filters.location) {
            results = results.filter(event => event.location === filters.location);
        }

        // Apply price range filter
        results = results.filter(event =>
            event.price >= filters.priceRange.min &&
            event.price <= filters.priceRange.max
        );

        // Apply date range filter
        if (filters.dateRange.start) {
            results = results.filter(event => new Date(event.date) >= new Date(filters.dateRange.start));
        }

        if (filters.dateRange.end) {
            results = results.filter(event => new Date(event.date) <= new Date(filters.dateRange.end));
        }

        setFilteredEvents(results);
    }, [searchTerm, filters, events]);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle filter changes
    const handleFilterChange = (filterType, value) => {
        if (filterType === 'priceMin' || filterType === 'priceMax') {
            setFilters({
                ...filters,
                priceRange: {
                    ...filters.priceRange,
                    [filterType === 'priceMin' ? 'min' : 'max']: parseInt(value) || 0
                }
            });
        } else if (filterType === 'dateStart' || filterType === 'dateEnd') {
            setFilters({
                ...filters,
                dateRange: {
                    ...filters.dateRange,
                    [filterType === 'dateStart' ? 'start' : 'end']: value
                }
            });
        } else {
            setFilters({
                ...filters,
                [filterType]: value
            });
        }
    };

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm('');
        setFilters({
            category: '',
            location: '',
            priceRange: {
                min: 0,
                max: 1000
            },
            dateRange: {
                start: '',
                end: ''
            }
        });
    };

    return (
        <div className="container mx-auto pb-4">
            <h2 className="mb-6">Upcoming Volunteer Opportunities</h2>

            {/* Row that contains search and filter options */}
            <div className="flex flex-wrap items-center p-4 rounded-md mb-6">
                {/* Search Bar */}
                <div className="flex items-center gap-2 flex-grow">
                    <input
                        type="text"
                        placeholder="Search using keywords..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full p-2 border rounded"
                    />
                    <button
                        onClick={resetFilters}
                        className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
                    >
                        Reset
                    </button>
                </div>

                {/* Category Filter */}
                <div className="w-48">
                    <label className="block text-sm font-medium">Category</label>
                    <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                {/* Location Filter */}
                <div className="w-48">
                    <label className="block text-sm font-medium">Location</label>
                    <select
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">All Locations</option>
                        {locations.map(location => (
                            <option key={location} value={location}>{location}</option>
                        ))}
                    </select>
                </div>

                {/* Price Range Filter */}
                <div className="w-60">
                    <label className="block text-sm font-medium">Price Range</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.priceRange.min}
                            onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                            className="w-1/2 p-2 border rounded"
                        />
                        <span>to</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.priceRange.max}
                            onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                            className="w-1/2 p-2 border rounded"
                        />
                    </div>
                </div>

                {/* Date Range Filter */}
                <div className="w-60">
                    <label className="block text-sm font-medium">Date Range</label>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={filters.dateRange.start}
                            onChange={(e) => handleFilterChange('dateStart', e.target.value)}
                            className="w-1/2 p-2 border rounded"
                        />
                        <input
                            type="date"
                            value={filters.dateRange.end}
                            onChange={(e) => handleFilterChange('dateEnd', e.target.value)}
                            className="w-1/2 p-2 border rounded"
                        />
                    </div>
                </div>
            </div>

            {/* Events List */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Events ({filteredEvents.length})</h2>
                    <div className="text-sm text-gray-500">
                        {filteredEvents.length === 0 && "No events match your filters"}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredEvents.map(event => (
                        <div key={event.id} className="border p-4 rounded hover:shadow-md">
                            <div className="flex justify-between mb-2">
                                <h3 className="text-xl font-semibold">{event.title}</h3>
                                <span className="font-bold">${event.price}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                    {event.category}
                                </span>
                                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                                    {new Date(event.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <p className="text-gray-600 mb-2">{event.location}</p>
                            <p className="text-gray-700">{event.description}</p>
                            <button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>

    );
}

export default Home;