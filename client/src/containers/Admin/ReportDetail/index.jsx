import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Api from "../../../helpers/Api";

const AdminReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for status update modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [resolutionAction, setResolutionAction] = useState("none");
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      const response = await Api.getAdminReportById(id);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch report details");
      }

      setReport(data.report);
      // Initialize with current status
      setNewStatus(data.report.status);
      setAdminNotes(data.report.admin_notes || "");
      setResolutionAction(data.report.resolution_action || "none");
    } catch (err) {
      console.error("Error fetching report details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to navigate to the reported user's detail page
  const handleViewUserDetail = () => {
    if (report.reported_type === "Event") {
      // If it's an event, navigate to event detail page
      navigate(`/admin/events/${report.reported_id._id}`);
    } else {
      // For Volunteer or Organiser, navigate to user detail page
      navigate(`/admin/users/${report.reported_id.user_id}`);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === report.status) {
      setShowStatusModal(false);
      return;
    }

    try {
      setUpdateLoading(true);
      console.log("Starting status update with:", {
        newStatus,
        adminNotes,
        resolutionAction,
        reportType: report.reported_type,
      });

      // If resolving or dismissing, require admin notes
      if (
        (newStatus === "resolved" || newStatus === "dismissed") &&
        !adminNotes
      ) {
        alert(
          "Please provide admin notes for resolving or dismissing a report"
        );
        return;
      }

      // If resolving, validate resolution action
      if (
        newStatus === "resolved" &&
        resolutionAction === "none" &&
        report.reported_type !== "Event"
      ) {
        alert("Please select a resolution action when resolving a report");
        return;
      }

      // Prepare data for API call
      const requestBody = {
        status: newStatus,
        admin_notes: adminNotes || "", // Ensure we send an empty string, not undefined
      };

      // Only add resolution_action when status is resolved
      if (newStatus === "resolved") {
        requestBody.resolution_action = resolutionAction;
      }

      console.log("Sending request body:", requestBody);

      // Make direct fetch request to ensure correct data format
      const response = await fetch(`${Api.SERVER_PREFIX}/admin/reports/${id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(requestBody),
      });

      // Log the raw response status
      console.log("Response status:", response.status);

      // Try to get the response text first to see raw response
      const responseText = await response.text();
      console.log("Raw response text:", responseText);

      // Parse JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed response data:", data);
      } catch (parseError) {
        console.error("Error parsing response JSON:", parseError);
        throw new Error(
          `Server response not valid JSON: ${responseText.substring(0, 100)}...`
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to update report status");
      }

      // Update local state with new status
      setReport(data.report);

      // Close modal
      setShowStatusModal(false);

      // Show success notification
      alert("Report status updated successfully");
    } catch (err) {
      console.error("Error updating report status:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Function to get appropriate status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case "under_review":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            Under Review
          </span>
        );
      case "resolved":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Resolved
          </span>
        );
      case "dismissed":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            Dismissed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
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
              onClick={fetchReportDetails}
            >
              Try Again
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => navigate("/admin/reports")}
            >
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Report Details</h1>
        <div>
          {report.status !== "resolved" && report.status !== "dismissed" && (
            <button
              onClick={() => setShowStatusModal(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Update Status
            </button>
          )}
          <Link
            to="/admin/reports"
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Reports
          </Link>
        </div>
      </div>

      {/* Report Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Report Overview */}
        <div className="bg-white rounded-lg shadow p-6 col-span-2">
          <h2 className="text-xl font-semibold mb-4">Report Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Report ID:</p>
              <p className="font-medium">{report._id}</p>
            </div>
            <div>
              <p className="text-gray-600">Status:</p>
              <p>{getStatusBadge(report.status)}</p>
            </div>
            <div>
              <p className="text-gray-600">Created At:</p>
              <p className="font-medium">{formatDate(report.created_at)}</p>
            </div>
            <div>
              <p className="text-gray-600">Reported Type:</p>
              <p className="font-medium">{report.reported_type}</p>
            </div>
            <div>
              <p className="text-gray-600">Reported Entity:</p>
              <div className="flex items-center space-x-3">
                <p className="font-medium">
                  {report.reported_id?.name ||
                    report.reported_id?.organisation_name ||
                    "Unknown"}
                </p>
                {(report.reported_type === "Volunteer" ||
                  report.reported_type === "Organiser") &&
                  report.reported_id && (
                    <button
                      onClick={handleViewUserDetail}
                      className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded"
                    >
                      Manage User
                    </button>
                  )}
              </div>
            </div>
            {report.event_id && (
              <div>
                <p className="text-gray-600">Related Event:</p>
                <p className="font-medium">
                  <Link
                    to={`/events/${report.event_id._id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {report.event_id.name}
                  </Link>
                </p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <p className="text-gray-600">Reason for Report:</p>
            <p className="mt-2 p-3 bg-gray-50 rounded">{report.reason}</p>
          </div>

          {report.details && (
            <div className="mt-4">
              <p className="text-gray-600">Additional Details:</p>
              <p className="mt-2 p-3 bg-gray-50 rounded">{report.details}</p>
            </div>
          )}

          {report.admin_notes && (
            <div className="mt-4">
              <p className="text-gray-600">Admin Notes:</p>
              <p className="mt-2 p-3 bg-gray-50 rounded">
                {report.admin_notes}
              </p>
            </div>
          )}

          {report.status === "resolved" && (
            <div className="mt-4">
              <p className="text-gray-600">Resolution Action:</p>
              <p className="mt-2 font-medium">
                {report.resolution_action === "none"
                  ? "No action taken"
                  : report.resolution_action}
              </p>
            </div>
          )}
        </div>

        {/* Reporter & Resolution Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Reporter & Resolution</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Reporter Email:</p>
              <p className="font-medium">
                {report.reporter_id?.email || "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Reporter Role:</p>
              <p className="font-medium">{report.reporter_role}</p>
            </div>

            <hr className="my-4" />

            {report.status === "resolved" || report.status === "dismissed" ? (
              <>
                <div>
                  <p className="text-gray-600">Resolved By:</p>
                  <p className="font-medium">
                    {report.resolved_by?.name || "Unknown Admin"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Resolution Date:</p>
                  <p className="font-medium">
                    {formatDate(report.resolution_date)}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-yellow-600">
                This report is still pending resolution
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reported Entity Details */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Reported Entity Details</h2>

        {report.reported_type === "Volunteer" && report.reported_id && (
          <div>
            <h3 className="font-medium text-lg">Volunteer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div>
                <p className="text-gray-600">Name:</p>
                <p className="font-medium">
                  {report.reported_id.name || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Contact:</p>
                <p className="font-medium">
                  {report.reported_id.phone || "Not provided"}
                </p>
              </div>
              <div>
                <Link
                  to={`/admin/users/${report.reported_id.user_id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View Full Profile
                </Link>
              </div>
            </div>
          </div>
        )}

        {report.reported_type === "Organiser" && report.reported_id && (
          <div>
            <h3 className="font-medium text-lg">Organiser Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div>
                <p className="text-gray-600">Organisation:</p>
                <p className="font-medium">
                  {report.reported_id.organisation_name || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Contact:</p>
                <p className="font-medium">
                  {report.reported_id.phone || "Not provided"}
                </p>
              </div>
              <div>
                <Link
                  to={`/admin/users/${report.reported_id.user_id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View Full Profile
                </Link>
              </div>
            </div>
          </div>
        )}

        {report.reported_type === "Event" && report.reported_id && (
          <div>
            <h3 className="font-medium text-lg">Event Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div>
                <p className="text-gray-600">Event Name:</p>
                <p className="font-medium">
                  {report.reported_id.name || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Location:</p>
                <p className="font-medium">
                  {report.reported_id.location || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Status:</p>
                <p className="font-medium">{report.reported_id.status}</p>
              </div>
              <div>
                <p className="text-gray-600">Date:</p>
                <p className="font-medium">
                  {formatDate(
                    report.reported_id.start_datetime ||
                      report.reported_id.recurrence_start_date
                  )}
                </p>
              </div>
              <div>
                <Link
                  to={`/events/${report.reported_id._id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View Event
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 text-center">
                Update Report Status
              </h3>
              <div className="mt-4 px-2">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Current Status: {getStatusBadge(report.status)}
                  </label>
                  <select
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows="3"
                    placeholder="Add admin notes (required for resolved/dismissed)"
                  ></textarea>
                </div>

                {newStatus === "resolved" && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Resolution Action
                    </label>
                    <select
                      className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={resolutionAction}
                      onChange={(e) => setResolutionAction(e.target.value)}
                    >
                      <option value="none">No Action Required</option>
                      <option value="warning">Warning</option>
                      <option value="suspension">Suspension</option>
                      <option value="ban">Ban</option>
                      {report.reported_type === "Event" && (
                        <option value="event_removed">Remove Event</option>
                      )}
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={updateLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={
                      updateLoading || !newStatus || newStatus === report.status
                    }
                  >
                    {updateLoading ? "Updating..." : "Update Status"}
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

export default AdminReportDetail;
