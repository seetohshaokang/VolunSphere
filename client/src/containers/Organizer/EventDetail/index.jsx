// src/containers/Organizer/EventDetail/index.jsx
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
	AlertCircle,
	CalendarIcon,
	MapPinIcon,
	PencilIcon,
	PlusIcon,
	UsersIcon,
	XCircleIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ContentHeader from "../../../components/ContentHeader";
import { useAuth } from "../../../contexts/AuthContext";
import Api from "../../../helpers/Api";

function OrganizerEventDetail() {
	const { eventId } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [event, setEvent] = useState(null);
	const [editedEvent, setEditedEvent] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isEditing, setIsEditing] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [error, setError] = useState(null);
	const [authError, setAuthError] = useState(false);

	useEffect(() => {
		const fetchEventDetails = async () => {
			setLoading(true);
			setError(null);

			try {
				// Fetch the event data from the API
				const response = await Api.getEvent(eventId);

				// Check for auth issues
				if (response.status === 401) {
					setAuthError(true);
					setLoading(false);
					return;
				}

				if (!response.ok) {
					throw new Error(`Error fetching event: ${response.status}`);
				}

				const eventData = await response.json();

				// Transform the API data to match our component's expected format
				const formattedEvent = {
					id: eventData.id,
					title: eventData.name || "Event Name",
					organizer: eventData.organiser_name || "Your Organization",
					date: eventData.start_date
						? `${new Date(
								eventData.start_date
						  ).toLocaleDateString()} - ${
								eventData.end_date
									? new Date(
											eventData.end_date
									  ).toLocaleDateString()
									: "Ongoing"
						  }`
						: "Date not specified",
					specificDates: eventData.start_date
						? [new Date(eventData.start_date).toLocaleDateString()]
						: [],
					location: eventData.location || "Location not specified",
					category: eventData.cause || "General",
					tags: eventData.cause ? [eventData.cause] : ["Volunteer"],
					remainingSlots: eventData.max_volunteers
						? eventData.max_volunteers -
						  (eventData.registered_count || 0)
						: 0,
					totalSlots: eventData.max_volunteers || 0,
					description:
						eventData.description || "No description provided",
					requirements: eventData.requirements
						? eventData.requirements.split(",").map((r) => r.trim())
						: ["No specific requirements"],
					responsibilities: eventData.responsibilities
						? eventData.responsibilities
								.split(",")
								.map((r) => r.trim())
						: ["Help out at the event"],
					contactPerson:
						eventData.contact_person || "Event Coordinator",
					contactEmail:
						eventData.contact_email ||
						user?.email ||
						"contact@organization.com",
					imageUrl:
						eventData.image_url || "/src/assets/default-event.jpg",
					status: eventData.status || "active",
				};

				setEvent(formattedEvent);
				setEditedEvent(formattedEvent);
			} catch (error) {
				console.error("Error fetching event details:", error);
				setError(
					"Failed to load event details. Please try again later."
				);
			} finally {
				setLoading(false);
			}
		};

		fetchEventDetails();
	}, [eventId, user?.email]);

	// Edit Mode functions
	const toggleEditMode = () => {
		if (isEditing) {
			setEditedEvent(event);
		}
		setIsEditing(!isEditing);
	};

	const handleEditField = (field, value) => {
		setEditedEvent({
			...editedEvent,
			[field]: value,
		});
	};

	const handleArrayField = (field, index, value) => {
		const newArray = [...editedEvent[field]];
		newArray[index] = value;
		setEditedEvent({
			...editedEvent,
			[field]: newArray,
		});
	};

	const addArrayItem = (field) => {
		const newArray = [...editedEvent[field], ""];
		setEditedEvent({
			...editedEvent,
			[field]: newArray,
		});
	};

	const removeArrayItem = (field, index) => {
		const newArray = [...editedEvent[field]];
		newArray.splice(index, 1);
		setEditedEvent({
			...editedEvent,
			[field]: newArray,
		});
	};

	const saveEventChanges = () => {
		setShowConfirmModal(true);
	};

	const confirmSaveChanges = async () => {
		try {
			// Convert the edited data to the format expected by the API
			const apiEventData = {
				name: editedEvent.title,
				description: editedEvent.description,
				location: editedEvent.location,
				cause: editedEvent.category,
				max_volunteers: editedEvent.totalSlots,
				status: editedEvent.status,
				requirements: editedEvent.requirements.join(", "),
				responsibilities: editedEvent.responsibilities.join(", "),
				contact_person: editedEvent.contactPerson,
				contact_email: editedEvent.contactEmail,
			};

			// In a real implementation, uncomment this to actually update the event
			// const response = await Api.updateEvent(event.id, apiEventData);
			// if (!response.ok) throw new Error("Failed to update event");

			setEvent(editedEvent);
			setIsEditing(false);
			setShowConfirmModal(false);
			setSaveSuccess(true);

			setTimeout(() => {
				setSaveSuccess(false);
			}, 3000);
		} catch (err) {
			console.error("Error updating event:", err);
			setError("Failed to update event. Please try again.");
			setShowConfirmModal(false);
		}
	};

	// Loading state
	if (loading) {
		return (
			<div className="flex justify-center py-12">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
				<p className="ml-3 text-lg">Loading event details...</p>
			</div>
		);
	}

	// Auth error state
	if (authError) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<Alert variant="destructive" className="mb-6">
					<AlertCircle className="h-5 w-5 mr-2" />
					<AlertDescription>
						You need to be logged in to view this page. Please log
						in and try again.
					</AlertDescription>
				</Alert>
				<div className="flex justify-center">
					<Button onClick={() => navigate("/login")}>
						Go to Login
					</Button>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<Alert variant="destructive" className="mb-6">
					<AlertCircle className="h-5 w-5 mr-2" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
				<div className="flex justify-center">
					<Button onClick={() => navigate("/organizer")}>
						Back to Dashboard
					</Button>
				</div>
			</div>
		);
	}

	// No event found state
	if (!event) {
		return (
			<Alert variant="destructive" className="my-6">
				<AlertDescription>
					Event not found or has been removed.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<ContentHeader
				title={event.title}
				links={[
					{ to: "/", label: "Dashboard" },
					{ to: "/organizer", label: "My Events" },
					{ label: event.title, isActive: true },
				]}
			/>

			{/* Event header with edit button */}
			<div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
				<div>
					<h1 className="text-2xl font-semibold text-gray-800 mb-2">
						{event.title}
					</h1>
					<div className="flex items-center mb-2">
						<div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
						<span className="text-gray-600">{event.organizer}</span>
					</div>

					<div className="mt-2">
						<Badge
							className={
								event.status === "active"
									? "bg-green-100 text-green-800"
									: event.status === "draft"
									? "bg-yellow-100 text-yellow-800"
									: "bg-gray-100 text-gray-800"
							}
						>
							{event.status.toUpperCase()}
						</Badge>
					</div>
				</div>

				<div className="flex mt-4 md:mt-0 space-x-2">
					<Button
						variant={isEditing ? "outline" : "default"}
						onClick={toggleEditMode}
					>
						{isEditing ? (
							"Cancel"
						) : (
							<>
								<PencilIcon className="h-4 w-4 mr-2" /> Edit
							</>
						)}
					</Button>

					{isEditing && (
						<Button onClick={saveEventChanges}>Save Changes</Button>
					)}
				</div>
			</div>

			{/* Success message */}
			{saveSuccess && (
				<Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
					<AlertDescription>
						Event details have been updated successfully!
					</AlertDescription>
				</Alert>
			)}

			{/* Main content */}
			<Card className="mb-6 shadow-sm">
				<CardContent className="p-6">
					{isEditing ? (
						/* Edit mode */
						<div className="space-y-6">
							<div>
								<Label htmlFor="title">Event Title</Label>
								<Input
									id="title"
									value={editedEvent.title}
									onChange={(e) =>
										handleEditField("title", e.target.value)
									}
									className="mt-1"
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<Label htmlFor="organizer">Organizer</Label>
									<Input
										id="organizer"
										value={editedEvent.organizer}
										onChange={(e) =>
											handleEditField(
												"organizer",
												e.target.value
											)
										}
										className="mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="category">Category</Label>
									<Select
										value={editedEvent.category}
										onValueChange={(value) =>
											handleEditField("category", value)
										}
									>
										<SelectTrigger
											id="category"
											className="mt-1"
										>
											<SelectValue placeholder="Select a category" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Education">
												Education
											</SelectItem>
											<SelectItem value="Environment">
												Environment
											</SelectItem>
											<SelectItem value="Health">
												Health
											</SelectItem>
											<SelectItem value="Arts & Culture">
												Arts & Culture
											</SelectItem>
											<SelectItem value="Animal Welfare">
												Animal Welfare
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div>
								<Label htmlFor="date">Schedule</Label>
								<Input
									id="date"
									value={editedEvent.date}
									onChange={(e) =>
										handleEditField("date", e.target.value)
									}
									className="mt-1"
								/>
							</div>

							<div>
								<Label>Specific Dates</Label>
								<div className="space-y-2 mt-1">
									{editedEvent.specificDates.map(
										(date, index) => (
											<div
												className="flex items-center gap-2"
												key={index}
											>
												<Input
													value={date}
													onChange={(e) =>
														handleArrayField(
															"specificDates",
															index,
															e.target.value
														)
													}
												/>
												<Button
													variant="outline"
													size="icon"
													onClick={() =>
														removeArrayItem(
															"specificDates",
															index
														)
													}
													className="flex-shrink-0"
												>
													<XCircleIcon className="h-4 w-4" />
												</Button>
											</div>
										)
									)}
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											addArrayItem("specificDates")
										}
										className="mt-2"
									>
										<PlusIcon className="h-4 w-4 mr-1" />{" "}
										Add Date
									</Button>
								</div>
							</div>

							<div>
								<Label htmlFor="location">Location</Label>
								<Input
									id="location"
									value={editedEvent.location}
									onChange={(e) =>
										handleEditField(
											"location",
											e.target.value
										)
									}
									className="mt-1"
								/>
							</div>

							<div>
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									rows={4}
									value={editedEvent.description}
									onChange={(e) =>
										handleEditField(
											"description",
											e.target.value
										)
									}
									className="mt-1"
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<Label htmlFor="totalSlots">
										Total Available Slots
									</Label>
									<Input
										id="totalSlots"
										type="number"
										value={editedEvent.totalSlots}
										onChange={(e) =>
											handleEditField(
												"totalSlots",
												parseInt(e.target.value)
											)
										}
										className="mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="remainingSlots">
										Remaining Slots
									</Label>
									<Input
										id="remainingSlots"
										type="number"
										value={editedEvent.remainingSlots}
										onChange={(e) =>
											handleEditField(
												"remainingSlots",
												parseInt(e.target.value)
											)
										}
										className="mt-1"
									/>
								</div>
							</div>

							<div>
								<Label>Tags</Label>
								<div className="space-y-2 mt-1">
									{editedEvent.tags.map((tag, index) => (
										<div
											className="flex items-center gap-2"
											key={index}
										>
											<Input
												value={tag}
												onChange={(e) =>
													handleArrayField(
														"tags",
														index,
														e.target.value
													)
												}
											/>
											<Button
												variant="outline"
												size="icon"
												onClick={() =>
													removeArrayItem(
														"tags",
														index
													)
												}
												className="flex-shrink-0"
											>
												<XCircleIcon className="h-4 w-4" />
											</Button>
										</div>
									))}
									<Button
										variant="outline"
										size="sm"
										onClick={() => addArrayItem("tags")}
										className="mt-2"
									>
										<PlusIcon className="h-4 w-4 mr-1" />{" "}
										Add Tag
									</Button>
								</div>
							</div>

							<div>
								<Label>Requirements</Label>
								<div className="space-y-2 mt-1">
									{editedEvent.requirements.map(
										(requirement, index) => (
											<div
												className="flex items-center gap-2"
												key={index}
											>
												<Input
													value={requirement}
													onChange={(e) =>
														handleArrayField(
															"requirements",
															index,
															e.target.value
														)
													}
												/>
												<Button
													variant="outline"
													size="icon"
													onClick={() =>
														removeArrayItem(
															"requirements",
															index
														)
													}
													className="flex-shrink-0"
												>
													<XCircleIcon className="h-4 w-4" />
												</Button>
											</div>
										)
									)}
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											addArrayItem("requirements")
										}
										className="mt-2"
									>
										<PlusIcon className="h-4 w-4 mr-1" />{" "}
										Add Requirement
									</Button>
								</div>
							</div>

							<div>
								<Label>Responsibilities</Label>
								<div className="space-y-2 mt-1">
									{editedEvent.responsibilities.map(
										(responsibility, index) => (
											<div
												className="flex items-center gap-2"
												key={index}
											>
												<Input
													value={responsibility}
													onChange={(e) =>
														handleArrayField(
															"responsibilities",
															index,
															e.target.value
														)
													}
												/>
												<Button
													variant="outline"
													size="icon"
													onClick={() =>
														removeArrayItem(
															"responsibilities",
															index
														)
													}
													className="flex-shrink-0"
												>
													<XCircleIcon className="h-4 w-4" />
												</Button>
											</div>
										)
									)}
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											addArrayItem("responsibilities")
										}
										className="mt-2"
									>
										<PlusIcon className="h-4 w-4 mr-1" />{" "}
										Add Responsibility
									</Button>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<Label htmlFor="contactPerson">
										Contact Person
									</Label>
									<Input
										id="contactPerson"
										value={editedEvent.contactPerson}
										onChange={(e) =>
											handleEditField(
												"contactPerson",
												e.target.value
											)
										}
										className="mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="contactEmail">
										Contact Email
									</Label>
									<Input
										id="contactEmail"
										type="email"
										value={editedEvent.contactEmail}
										onChange={(e) =>
											handleEditField(
												"contactEmail",
												e.target.value
											)
										}
										className="mt-1"
									/>
								</div>
							</div>

							<div>
								<Label htmlFor="status">Event Status</Label>
								<Select
									value={editedEvent.status}
									onValueChange={(value) =>
										handleEditField("status", value)
									}
								>
									<SelectTrigger id="status" className="mt-1">
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="draft">
											Draft
										</SelectItem>
										<SelectItem value="active">
											Active
										</SelectItem>
										<SelectItem value="completed">
											Completed
										</SelectItem>
										<SelectItem value="cancelled">
											Cancelled
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					) : (
						/* View mode */
						<>
							{/* Banner image */}
							<div className="mb-6">
								<img
									src={
										event.imageUrl ||
										"/src/assets/default-event.jpg"
									}
									alt={event.title}
									className="w-full h-64 object-cover rounded-md shadow-sm"
								/>
							</div>

							{/* Event key information */}
							<div className="bg-gray-50 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="flex items-start">
									<CalendarIcon className="h-5 w-5 text-primary mr-2 mt-0.5" />
									<div>
										<h3 className="text-sm font-semibold mb-1">
											Schedule
										</h3>
										<p className="text-gray-700">
											{event.date}
										</p>
									</div>
								</div>
								<div className="flex items-start">
									<MapPinIcon className="h-5 w-5 text-primary mr-2 mt-0.5" />
									<div>
										<h3 className="text-sm font-semibold mb-1">
											Location
										</h3>
										<p className="text-gray-700">
											{event.location}
										</p>
									</div>
								</div>
								<div className="flex items-start">
									<UsersIcon className="h-5 w-5 text-primary mr-2 mt-0.5" />
									<div>
										<h3 className="text-sm font-semibold mb-1">
											Registrations
										</h3>
										<p className="text-gray-700">
											{event.totalSlots -
												event.remainingSlots}{" "}
											of {event.totalSlots} spots filled
										</p>
									</div>
								</div>
							</div>

							{/* Tags */}
							<div className="mb-6">
								<h3 className="text-lg font-semibold mb-2">
									Tags
								</h3>
								<div className="flex flex-wrap gap-2">
									{event.tags.map((tag, index) => (
										<span
											key={index}
											className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
										>
											{tag}
										</span>
									))}
								</div>
							</div>

							{/* Description */}
							<div className="mb-6">
								<h3 className="text-lg font-semibold mb-2">
									Description
								</h3>
								<p className="text-gray-700">
									{event.description}
								</p>
							</div>

							{/* Specific dates */}
							<div className="mb-6">
								<h3 className="text-lg font-semibold mb-2">
									Event Dates
								</h3>
								<p className="mb-2">{event.date}</p>
								<ul className="list-none space-y-1">
									{event.specificDates.map((date, index) => (
										<li
											key={index}
											className="flex items-baseline"
										>
											<span className="text-primary mr-2">
												•
											</span>
											{date}
										</li>
									))}
								</ul>
							</div>

							{/* Requirements */}
							<div className="mb-6">
								<h3 className="text-lg font-semibold mb-2">
									Volunteer Requirements
								</h3>
								<ul className="list-disc pl-5 space-y-1">
									{event.requirements.map((req, index) => (
										<li
											key={index}
											className="text-gray-700"
										>
											{req}
										</li>
									))}
								</ul>
							</div>

							{/* Responsibilities */}
							<div className="mb-6">
								<h3 className="text-lg font-semibold mb-2">
									Volunteer Responsibilities
								</h3>
								<ul className="list-disc pl-5 space-y-1">
									{event.responsibilities.map(
										(resp, index) => (
											<li
												key={index}
												className="text-gray-700"
											>
												{resp}
											</li>
										)
									)}
								</ul>
							</div>

							{/* Contact Info */}
							<div>
								<h3 className="text-lg font-semibold mb-2">
									Contact Information
								</h3>
								<p className="text-gray-700">
									<span className="font-medium">
										Contact Person:
									</span>{" "}
									{event.contactPerson}
									<br />
									<span className="font-medium">
										Email:
									</span>{" "}
									{event.contactEmail}
								</p>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{/* Confirmation Modal */}
			{showConfirmModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg max-w-md w-full p-6">
						<h3 className="text-xl font-semibold mb-4">
							Confirm Changes
						</h3>
						<p className="text-gray-700 mb-6">
							Are you sure you want to save the changes to this
							event? This will update the information shown to
							volunteers.
						</p>
						<div className="flex justify-end space-x-3">
							<Button
								variant="outline"
								onClick={() => setShowConfirmModal(false)}
							>
								Cancel
							</Button>
							<Button onClick={confirmSaveChanges}>
								Save Changes
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default OrganizerEventDetail;
