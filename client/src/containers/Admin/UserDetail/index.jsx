import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Api from "../../../helpers/Api";

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for status update modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await Api.getAdminUserById(id);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user details');
      }
      
      setUserData(data);
      // Initialize new status with current status
      if (data.user) {
        setNewStatus(data.user.status);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === userData.user.status) {
      setShowStatusModal(false);
      return;
    }

    try {
      setStatusUpdateLoading(true);
      const response = await Api.updateUserStatus(id, newStatus, statusReason);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user status');
      }
      
      // Update local state with new status
      setUserData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          status: newStatus
        }
      }));
      
      // Close modal and reset
      setShowStatusModal(false);
      setStatusReason('');
      
      // Show success notification
      alert('User status updated successfully');
    } catch (err) {
      console.error('Error updating user status:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Function to get appropriate badge for different statuses
  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>;
      case 'suspended':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Suspended</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Inactive</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

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
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error}</p>
          <div className="flex justify-between mt-4">
            <button 
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={fetchUserData}
            >
              Try Again
            </button>
            <button 
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => navigate('/admin/users')}
            >
              Back to Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  const { user, profile, events = [], registrations = [], reports = [], actions = [] } = userData;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Details</h1>
        <div>
          <button 
            onClick={() => setShowStatusModal(true)}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Change Status
          </button>
          <Link 
            to="/admin/users"
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Users
          </Link>
        </div>
      </div>

      {/* User and Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 col-span-2">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Email:</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Role:</p>
              <p className="font-medium">{user.role}</p>
            </div>
            <div>
              <p className="text-gray-600">Status:</p>
              <p>{getStatusBadge(user.status)}</p>
            </div>
            <div>
              <p className="text-gray-600">Created:</p>
              <p className="font-medium">{formatDate(user.created_at)}</p>
            </div>
            <div>
              <p className="text-gray-600">Last Login:</p>
              <p className="font-medium">{formatDate(user.last_login)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Details</h2>
          {user.role === 'volunteer' ? (
            <div className="space-y-3">
              <div>
                <p className="text-gray-600">Name:</p>
                <p className="font-medium">{profile?.name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone:</p>
                <p className="font-medium">{profile?.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-600">NRIC Verified:</p>
                <p className="font-medium">
                  {profile?.nric_image?.verified 
                    ? <span className="text-green-600">Yes</span> 
                    : <span className="text-red-600">No</span>}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Skills:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile?.skills?.length > 0 
                    ? profile.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {skill}
                        </span>
                      ))
                    : <span className="text-gray-500">No skills listed</span>}
                </div>
              </div>
              <div>
                <p className="text-gray-600">Preferred Causes:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile?.preferred_causes?.length > 0 
                    ? profile.preferred_causes.map((cause, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {cause}
                        </span>
                      ))
                    : <span className="text-gray-500">No causes listed</span>}
                </div>
              </div>
            </div>
          ) : user.role === 'organiser' ? (
            <div className="space-y-3">
              <div>
                <p className="text-gray-600">Organisation:</p>
                <p className="font-medium">{profile?.organisation_name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone:</p>
                <p className="font-medium">{profile?.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-600">Verification Status:</p>
                <p className="font-medium">
                  {profile?.verification_status === 'verified' 
                    ? <span className="text-green-600">Verified</span> 
                    : profile?.verification_status === 'rejected'
                      ? <span className="text-red-600">Rejected</span>
                      : <span className="text-yellow-600">Pending</span>}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Website:</p>
                <p className="font-medium">{profile?.website || 'Not provided'}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Admin account - no profile details available</p>
          )}
        </div>
      </div>

      {/* Activity Details Tabs */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Activity</h2>
        
        {/* Events (for organisers) */}
        {user.role === 'organiser' && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Organized Events</h3>
            {events.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrations</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((event) => (
                      <tr key={event._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{event.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(event.start_datetime || event.recurrence_start_date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{event.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{event.registered_count} / {event.max_volunteers || 'Unlimited'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link to={`/events/${event._id}`} className="text-indigo-600 hover:text-indigo-900">View</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No events organized by this user.</p>
            )}
          </div>
        )}
        
        {/* Registrations (for volunteers) */}
        {user.role === 'volunteer' && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Event Registrations</h3>
            {registrations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {registrations.map((reg) => (
                      <tr key={reg._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{reg.event_id?.name || 'Unknown Event'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(reg.registration_date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{reg.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link to={`/events/${reg.event_id?._id}`} className="text-indigo-600 hover:text-indigo-900">View Event</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No event registrations for this user.</p>
            )}
          </div>
        )}
        
        {/* Reports */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Submitted Reports</h3>
          {reports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(report.created_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{report.reported_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{report.reason.substring(0, 30)}...</td>
                      <td className="px-6 py-4 whitespace-nowrap">{report.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/admin/reports/${report._id}`} className="text-indigo-600 hover:text-indigo-900">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No reports submitted by this user.</p>
          )}
        </div>
        
        {/* Admin Actions */}
        <div>
          <h3 className="text-lg font-medium mb-3">Admin Actions</h3>
          {actions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {actions.map((action) => (
                    <tr key={action._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(action.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{action.action}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{action.admin_id?.name || 'Unknown Admin'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{action.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No admin actions taken for this user.</p>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Update User Status</h3>
              <div className="mt-4 px-2">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Current Status: {getStatusBadge(userData.user.status)}
                  </label>
                  <select
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Reason for Status Change
                  </label>
                  <textarea
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={statusReason}
                    onChange={e => setStatusReason(e.target.value)}
                    rows="3"
                    placeholder="Provide a reason for this status change"
                  ></textarea>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={statusUpdateLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={statusUpdateLoading || !newStatus || newStatus === userData.user.status}
                  >
                    {statusUpdateLoading ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetail;