import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Api from "../../../helpers/Api";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await Api.getAdminDashboardStats();
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch dashboard statistics');
        }
        
        setStats(data.stats);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>Error: {error}</p>
        <button 
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          <div className="space-y-2">
            <p>Total Users: <span className="font-bold">{stats.users.total}</span></p>
            <p>Volunteers: <span className="font-bold">{stats.users.volunteers}</span></p>
            <p>Organisers: <span className="font-bold">{stats.users.organisers}</span></p>
            <p>New Users (30d): <span className="font-bold">{stats.users.newUsers}</span></p>
          </div>
          <Link 
            to="/admin/users" 
            className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Manage Users
          </Link>
        </div>

        {/* Events Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Events</h2>
          <div className="space-y-2">
            <p>Total Events: <span className="font-bold">{stats.events.total}</span></p>
            <p>Active Events: <span className="font-bold">{stats.events.active}</span></p>
            <p>Completed Events: <span className="font-bold">{stats.events.completed}</span></p>
            <p>Cancelled Events: <span className="font-bold">{stats.events.cancelled}</span></p>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold">Popular Causes:</h3>
            <ul className="list-disc pl-5">
              {stats.events.popularCauses?.map((cause, index) => (
                <li key={index}>{cause._id} ({cause.count})</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Registrations Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Registrations</h2>
          <div className="space-y-2">
            <p>Total Registrations: <span className="font-bold">{stats.registrations.total}</span></p>
            <p>Attended: <span className="font-bold">{stats.registrations.attended}</span></p>
            <p>No Shows: <span className="font-bold">{stats.registrations.noShow}</span></p>
            <p>Attendance Rate: <span className="font-bold">{stats.registrations.attendanceRate}%</span></p>
          </div>
        </div>

        {/* Reports & Verifications Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Reports & Verifications</h2>
          <div className="space-y-2">
            <p>Pending Reports: <span className="font-bold">{stats.reports.pending}</span></p>
            <p>Resolved Reports: <span className="font-bold">{stats.reports.resolved}</span></p>
            <p>Pending Verifications: <span className="font-bold">{stats.verifications.pending}</span></p>
          </div>
          <div className="mt-4 space-y-2">
            <Link 
              to="/admin/reports" 
              className="inline-block bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded w-full text-center"
            >
              Manage Reports
            </Link>
            <Link 
              to="/admin/verifications" 
              className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full text-center"
            >
              Verify NRIC
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/admin/users" 
            className="bg-blue-100 hover:bg-blue-200 p-4 rounded-lg flex items-center"
          >
            <div className="bg-blue-500 text-white p-3 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Manage Users</h3>
              <p className="text-sm text-gray-600">View and manage user accounts</p>
            </div>
          </Link>
          
          <Link 
            to="/admin/reports" 
            className="bg-yellow-100 hover:bg-yellow-200 p-4 rounded-lg flex items-center"
          >
            <div className="bg-yellow-500 text-white p-3 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Handle Reports</h3>
              <p className="text-sm text-gray-600">Review and manage user reports</p>
            </div>
          </Link>
          
          <Link 
            to="/admin/verifications" 
            className="bg-green-100 hover:bg-green-200 p-4 rounded-lg flex items-center"
          >
            <div className="bg-green-500 text-white p-3 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Verify NRIC</h3>
              <p className="text-sm text-gray-600">Process volunteer ID verifications</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;