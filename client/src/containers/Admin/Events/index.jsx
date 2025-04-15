// src/containers/Admin/Events/index.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Api from "../../../helpers/Api";

const AdminEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        limit: 10,
        total: 0
    });

    // Filters
    const [filters, setFilters] = useState({
        status: '',
        cause: '',
        search: '',
        page: 1
    });

    useEffect(() => {
        fetchEvents();
    }, [filters]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            // Use the general getEvents API but we'll need to update the Api.js file to add this function
            const response = await Api.getAdminEvents(filters);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch events');
            }

            setEvents(data.events);
            setPagination(data.pagination || {
                page: 1,
                pages: 1,
                limit: 10,
                total: data.events.length
            });
        } catch (err) {
            console.error('Error fetching events:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            page: 1 // Reset to first page when filter changes
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // The search will trigger via useEffect when filters change
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.pages) return;
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    // Function to get appropriate status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>;
            case 'completed':
                return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Completed</span>;
            case 'cancelled':
                return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Cancelled</span>;
            case 'draft':
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Draft</span>;
            default:
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Events</h1>
                <Link
                    to="/admin"
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                    Back to Dashboard
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Filters</h2>
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cause">
                            Cause/Category
                        </label>
                        <select
                            id="cause"
                            name="cause"
                            value={filters.cause}
                            onChange={handleFilterChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="">All Causes</option>
                            <option value="environment">Environment</option>
                            <option value="education">Education</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="social services">Social Services</option>
                            <option value="animal welfare">Animal Welfare</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="search">
                            Search
                        </label>
                        <input
                            id="search"
                            name="search"
                            type="text"
                            placeholder="Search by name or location..."
                            value={filters.search}
                            onChange={handleFilterChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                        >
                            Search
                        </button>
                    </div>
                </form>
            </div>

            {/* Loading and Error States */}
            {loading && (
                <div className="flex justify-center items-center h-64">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            )}

            {error && !loading && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>Error: {error}</p>
                    <button
                        className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        onClick={fetchEvents}
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Events Table */}
            {!loading && !error && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Event
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Organiser
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Location
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Registrations
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {events.length > 0 ? (
                                events.map((event) => (
                                    <tr key={event._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{event.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {event.causes && event.causes.map((cause, idx) => (
                                                    <span key={idx} className="mr-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-sm">
                                                        {cause}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {event.organiser_id?.organisation_name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {event.is_recurring
                                                ? `${formatDate(event.recurrence_start_date)} - ${formatDate(event.recurrence_end_date)}`
                                                : formatDate(event.start_datetime)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {event.location}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(event.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {event.registered_count} / {event.max_volunteers || 'Unlimited'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Link
                                                to={`/admin/events/${event._id}`}
                                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                        No events found matching the criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && events.length > 0 && (
                <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">
                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span> of <span className="font-medium">{pagination.total}</span> events
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className={`px-4 py-2 border rounded ${pagination.page === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.pages}
                            className={`px-4 py-2 border rounded ${pagination.page === pagination.pages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEvents;