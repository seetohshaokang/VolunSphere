import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ContentHeader from "../../components/ContentHeader";

function ManageEvent() {
	const { id } = useParams();
	const navigate = useNavigate();
	const isEditMode = Boolean(id);

	const [formData, setFormData] = useState({
		title: "",
		description: "",
		date: "",
		location: "",
		category: "",
		slots: 10,
		status: "active",
	});

	const [loading, setLoading] = useState(isEditMode);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (isEditMode) {
			// Fetch event data for editing
			// In real implementation, use your Api helper
			// Api.getEvent(id)
			//   .then(res => res.json())
			//   .then(data => {
			//     setFormData({
			//       title: data.title,
			//       description: data.description,
			//       date: data.date.substring(0, 10), // YYYY-MM-DD format for input[type="date"]
			//       location: data.location,
			//       category: data.category,
			//       slots: data.slots,
			//       status: data.status
			//     });
			//     setLoading(false);
			//   })
			//   .catch(err => {
			//     console.error("Error fetching event:", err);
			//     setError("Failed to load event data");
			//     setLoading(false);
			//   });

			// Simulating API call with sample data
			setTimeout(() => {
				setFormData({
					title: "Beach Cleanup",
					description:
						"Join us for a community beach cleanup event. Help keep our beaches clean!",
					date: "2025-04-15",
					location: "Miami Beach",
					category: "Environment",
					slots: 15,
					status: "active",
				});
				setLoading(false);
			}, 500);
		}
	}, [id, isEditMode]);

	const handleChange = (e) => {
		const { name, value, type } = e.target;
		setFormData({
			...formData,
			[name]: type === "number" ? parseInt(value, 10) : value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			if (isEditMode) {
				// Update existing event
				// In real implementation, use your Api helper
				// await Api.updateEvent(id, formData);
				console.log("Updating event:", id, formData);
			} else {
				// Create new event
				// In real implementation, use your Api helper
				// await Api.createEvent(formData);
				console.log("Creating new event:", formData);
			}

			// Navigate back to events list
			navigate("/events");
		} catch (err) {
			console.error("Error saving event:", err);
			setError("Failed to save event. Please try again.");
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center p-12">
				<div className="loading loading-spinner loading-lg text-primary"></div>
			</div>
		);
	}

	return (
		<>
			<ContentHeader
				title={isEditMode ? "Edit Event" : "Create New Event"}
				links={[
					{ to: "/", label: "Home" },
					{ to: "/events", label: "Events" },
					{
						label: isEditMode ? "Edit Event" : "Create Event",
						isActive: true,
					},
				]}
			/>

			<div className="card bg-base-100 shadow-xl">
				<div className="card-body">
					<h2 className="card-title mb-6">
						{isEditMode ? "Edit Event Details" : "Create New Event"}
					</h2>

					{error && (
						<div className="alert alert-error mb-6">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="stroke-current shrink-0 h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span>{error}</span>
						</div>
					)}

					<form onSubmit={handleSubmit}>
						<div className="form-control mb-4">
							<label className="label">
								<span className="label-text">Event Title</span>
							</label>
							<input
								type="text"
								className="input input-bordered"
								name="title"
								placeholder="Enter event title"
								value={formData.title}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="form-control mb-4">
							<label className="label">
								<span className="label-text">Description</span>
							</label>
							<textarea
								className="textarea textarea-bordered"
								name="description"
								rows="3"
								placeholder="Event description"
								value={formData.description}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="form-control mb-4">
							<label className="label">
								<span className="label-text">Event Date</span>
							</label>
							<input
								type="date"
								className="input input-bordered"
								name="date"
								value={formData.date}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="form-control mb-4">
							<label className="label">
								<span className="label-text">Location</span>
							</label>
							<input
								type="text"
								className="input input-bordered"
								name="location"
								placeholder="Event location"
								value={formData.location}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="form-control mb-4">
							<label className="label">
								<span className="label-text">Category</span>
							</label>
							<select
								className="select select-bordered"
								name="category"
								value={formData.category}
								onChange={handleChange}
								required
							>
								<option value="" disabled>
									Select a category
								</option>
								<option value="Environment">Environment</option>
								<option value="Social Services">
									Social Services
								</option>
								<option value="Education">Education</option>
								<option value="Healthcare">Healthcare</option>
								<option value="Animal Welfare">
									Animal Welfare
								</option>
								<option value="Community Development">
									Community Development
								</option>
							</select>
						</div>

						<div className="form-control mb-4">
							<label className="label">
								<span className="label-text">
									Volunteer Slots
								</span>
							</label>
							<input
								type="number"
								className="input input-bordered"
								name="slots"
								min="1"
								value={formData.slots}
								onChange={handleChange}
								required
							/>
						</div>

						{isEditMode && (
							<div className="form-control mb-4">
								<label className="label">
									<span className="label-text">Status</span>
								</label>
								<select
									className="select select-bordered"
									name="status"
									value={formData.status}
									onChange={handleChange}
								>
									<option value="active">Active</option>
									<option value="cancelled">Cancelled</option>
									<option value="completed">Completed</option>
								</select>
							</div>
						)}

						<div className="flex justify-end gap-2 mt-8">
							<Link to="/events" className="btn btn-ghost">
								Cancel
							</Link>
							<button type="submit" className="btn btn-primary">
								{isEditMode ? "Update Event" : "Create Event"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
}

export default ManageEvent;
