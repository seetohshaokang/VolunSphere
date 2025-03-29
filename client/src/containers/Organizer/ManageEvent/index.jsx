// src/containers/ManageEvent/index.jsx
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

function OrganizerManageEvent() {
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

	const handleSelectChange = (name, value) => {
		setFormData({
			...formData,
			[name]: value,
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
					{ to: "/events", label: "Events" },
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
							<Label htmlFor="title">Event Title</Label>
							<Input
								id="title"
								name="title"
								placeholder="Enter event title"
								value={formData.title}
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

						<div className="space-y-2">
							<Label htmlFor="date">Event Date</Label>
							<Input
								id="date"
								name="date"
								type="date"
								value={formData.date}
								onChange={handleChange}
								required
							/>
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
							<Label htmlFor="category">Category</Label>
							<Select
								value={formData.category}
								onValueChange={(value) =>
									handleSelectChange("category", value)
								}
								required
							>
								<SelectTrigger id="category">
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
							<Label htmlFor="slots">Volunteer Slots</Label>
							<Input
								id="slots"
								name="slots"
								type="number"
								min="1"
								value={formData.slots}
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
								<Link to="/events">Cancel</Link>
							</Button>
							<Button type="submit">
								{isEditMode ? "Update Event" : "Create Event"}
							</Button>
						</CardFooter>
					</form>
				</CardContent>
			</Card>
		</>
	);
}

export default OrganizerManageEvent;
