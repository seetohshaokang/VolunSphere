// src/containers/Organizer/ManageEvent/index.jsx - with real API integration
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ContentHeader from "../../../components/ContentHeader";
import Api from "../../../helpers/Api";

function OrganizerManageEvent() {
	const { id } = useParams();
	const navigate = useNavigate();
	const isEditMode = Boolean(id);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		start_date: "",
		end_date: "",
		start_time: "",
		end_time: "",
		location: "",
		cause: "",
		max_volunteers: 10,
		status: "active",
	});

	const [loading, setLoading] = useState(isEditMode);
	const [error, setError] = useState(null);
	const [submitLoading, setSubmitLoading] = useState(false);

	useEffect(() => {
		if (isEditMode) {
			// Fetch event data for editing
			const fetchEventDetails = async () => {
				try {
					const response = await Api.getEvent(id);
					const eventData = await response.json();

					// Update form with event data
					setFormData({
						name: eventData.name || "",
						description: eventData.description || "",
						start_date: eventData.start_date || "",
						end_date: eventData.end_date || "",
						start_time: eventData.start_time || "",
						end_time: eventData.end_time || "",
						location: eventData.location || "",
						cause: eventData.cause || "",
						max_volunteers: eventData.max_volunteers || 10,
						status: eventData.status || "active",
					});
				} catch (err) {
					console.error("Error fetching event:", err);
					setError("Failed to load event data. Please try again.");
				} finally {
					setLoading(false);
				}
			};

			fetchEventDetails();
		}
	}, [id, isEditMode]);

	const handleChange = (e) => {
		const { name, value, type } = e.target;
		setFormData({
			...formData,
			[name]: type === "number" ? parseInt(value, 10) : value,
		});
	};

	const handleSelectChange = (name, value) => {
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitLoading(true);
		setError(null);

		try {
			if (isEditMode) {
				// Update existing event
				const response = await Api.updateEvent(id, formData);
				const data = await response.json();

				if (response.ok) {
					navigate("/organizer");
				} else {
					setError(data.message || "Failed to update event");
				}
			} else {
				// Create new event
				const response = await Api.createEvent(formData);
				const data = await response.json();

				if (response.ok) {
					navigate("/organizer");
				} else {
					setError(data.message || "Failed to create event");
				}
			}
		} catch (err) {
			console.error("Error saving event:", err);
			setError("Failed to save event. Please try again.");
		} finally {
			setSubmitLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center p-12">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<>
			<ContentHeader
				title={isEditMode ? "Edit Event" : "Create New Event"}
				links={[
					{ to: "/", label: "Home" },
					{ to: "/organizer", label: "Events" },
					{
						label: isEditMode ? "Edit Event" : "Create Event",
						isActive: true,
					},
				]}
			/>

			<Card>
				<CardHeader>
					<CardTitle>
						{isEditMode ? "Edit Event Details" : "Create New Event"}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{error && (
						<Alert variant="destructive" className="mb-6">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Event Title</Label>
							<Input
								id="name"
								name="name"
								placeholder="Enter event title"
								value={formData.name}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								name="description"
								rows="3"
								placeholder="Event description"
								value={formData.description}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="start_date">Start Date</Label>
								<Input
									id="start_date"
									name="start_date"
									type="date"
									value={formData.start_date}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="end_date">End Date</Label>
								<Input
									id="end_date"
									name="end_date"
									type="date"
									value={formData.end_date}
									onChange={handleChange}
									required
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="start_time">Start Time</Label>
								<Input
									id="start_time"
									name="start_time"
									type="time"
									value={formData.start_time}
									onChange={handleChange}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="end_time">End Time</Label>
								<Input
									id="end_time"
									name="end_time"
									type="time"
									value={formData.end_time}
									onChange={handleChange}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="location">Location</Label>
							<Input
								id="location"
								name="location"
								placeholder="Event location"
								value={formData.location}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="cause">Category</Label>
							<Select
								value={formData.cause}
								onValueChange={(value) =>
									handleSelectChange("cause", value)
								}
								required
							>
								<SelectTrigger id="cause">
									<SelectValue placeholder="Select a category" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Environment">
										Environment
									</SelectItem>
									<SelectItem value="Social Services">
										Social Services
									</SelectItem>
									<SelectItem value="Education">
										Education
									</SelectItem>
									<SelectItem value="Healthcare">
										Healthcare
									</SelectItem>
									<SelectItem value="Animal Welfare">
										Animal Welfare
									</SelectItem>
									<SelectItem value="Community Development">
										Community Development
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="max_volunteers">
								Volunteer Slots
							</Label>
							<Input
								id="max_volunteers"
								name="max_volunteers"
								type="number"
								min="1"
								value={formData.max_volunteers}
								onChange={handleChange}
								required
							/>
						</div>

						{isEditMode && (
							<div className="space-y-2">
								<Label htmlFor="status">Status</Label>
								<Select
									value={formData.status}
									onValueChange={(value) =>
										handleSelectChange("status", value)
									}
								>
									<SelectTrigger id="status">
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="active">
											Active
										</SelectItem>
										<SelectItem value="cancelled">
											Cancelled
										</SelectItem>
										<SelectItem value="completed">
											Completed
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}

						<CardFooter className="flex justify-end gap-2 px-0 pt-4">
							<Button variant="outline" asChild>
								<Link to="/organizer">Cancel</Link>
							</Button>
							<Button type="submit" disabled={submitLoading}>
								{submitLoading ? (
									<div className="flex items-center">
										<div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full"></div>
										{isEditMode
											? "Updating..."
											: "Creating..."}
									</div>
								) : (
									<>
										{isEditMode
											? "Update Event"
											: "Create Event"}
									</>
								)}
							</Button>
						</CardFooter>
					</form>
				</CardContent>
			</Card>
		</>
	);
}

export default OrganizerManageEvent;
