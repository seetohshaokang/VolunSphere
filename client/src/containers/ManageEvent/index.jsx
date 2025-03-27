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
		return <div className="content">Loading event data...</div>;
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
			<section className="content">
				<div className="container-fluid">
					<div className="row">
						<div className="col-md-12">
							<div className="card card-primary">
								<div className="card-header">
									<h3 className="card-title">
										{isEditMode
											? "Edit Event Details"
											: "Create New Event"}
									</h3>
								</div>

								{error && (
									<div className="alert alert-danger m-3">
										{error}
									</div>
								)}

								<form onSubmit={handleSubmit}>
									<div className="card-body">
										<div className="form-group">
											<label htmlFor="title">
												Event Title
											</label>
											<input
												type="text"
												className="form-control"
												id="title"
												name="title"
												placeholder="Enter event title"
												value={formData.title}
												onChange={handleChange}
												required
											/>
										</div>

										<div className="form-group">
											<label htmlFor="description">
												Description
											</label>
											<textarea
												className="form-control"
												id="description"
												name="description"
												rows="3"
												placeholder="Event description"
												value={formData.description}
												onChange={handleChange}
												required
											/>
										</div>

										<div className="form-group">
											<label htmlFor="date">
												Event Date
											</label>
											<input
												type="date"
												className="form-control"
												id="date"
												name="date"
												value={formData.date}
												onChange={handleChange}
												required
											/>
										</div>

										<div className="form-group">
											<label htmlFor="location">
												Location
											</label>
											<input
												type="text"
												className="form-control"
												id="location"
												name="location"
												placeholder="Event location"
												value={formData.location}
												onChange={handleChange}
												required
											/>
										</div>

										<div className="form-group">
											<label htmlFor="category">
												Category
											</label>
											<select
												className="form-control"
												id="category"
												name="category"
												value={formData.category}
												onChange={handleChange}
												required
											>
												<option value="">
													Select a category
												</option>
												<option value="Environment">
													Environment
												</option>
												<option value="Social Services">
													Social Services
												</option>
												<option value="Education">
													Education
												</option>
												<option value="Healthcare">
													Healthcare
												</option>
												<option value="Animal Welfare">
													Animal Welfare
												</option>
												<option value="Community Development">
													Community Development
												</option>
											</select>
										</div>

										<div className="form-group">
											<label htmlFor="slots">
												Volunteer Slots
											</label>
											<input
												type="number"
												className="form-control"
												id="slots"
												name="slots"
												min="1"
												value={formData.slots}
												onChange={handleChange}
												required
											/>
										</div>

										{isEditMode && (
											<div className="form-group">
												<label htmlFor="status">
													Status
												</label>
												<select
													className="form-control"
													id="status"
													name="status"
													value={formData.status}
													onChange={handleChange}
												>
													<option value="active">
														Active
													</option>
													<option value="cancelled">
														Cancelled
													</option>
													<option value="completed">
														Completed
													</option>
												</select>
											</div>
										)}
									</div>

									<div className="card-footer">
										<button
											type="submit"
											className="btn btn-primary"
										>
											{isEditMode
												? "Update Event"
												: "Create Event"}
										</button>
										<Link
											to="/events"
											className="btn btn-default ml-2"
										>
											Cancel
										</Link>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}

export default ManageEvent;
