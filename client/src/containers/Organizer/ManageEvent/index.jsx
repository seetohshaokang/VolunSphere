// src/containers/Organizer/ManageEvent/index.jsx
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
	FileText,
	MapPinIcon,
	RepeatIcon,
	Trash,
	Upload,
	User,
	XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ContentHeader from "../../../components/ContentHeader";
import GoogleMaps from "../../../components/GoogleMaps";
import Api from "../../../helpers/Api";

// Add custom focus styles for inputs
const customInputStyles = `
  .custom-input:focus {
    border-width: 2px;
    border-color: rgb(59 130 246); /* Tailwind blue-500 */
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    outline: none;
  }
  
  input[type="date"], input[type="time"] {
    cursor: pointer !important;
  }
  
  input[type="date"]::-webkit-calendar-picker-indicator,
  input[type="time"]::-webkit-calendar-picker-indicator {
    cursor: pointer !important;
  }
`;

const DAYS_OF_WEEK = [
	{ value: 0, label: "Sunday" },
	{ value: 1, label: "Monday" },
	{ value: 2, label: "Tuesday" },
	{ value: 3, label: "Wednesday" },
	{ value: 4, label: "Thursday" },
	{ value: 5, label: "Friday" },
	{ value: 6, label: "Saturday" },
];

function OrganizerManageEvent() {
	const { id } = useParams();
	const navigate = useNavigate();
	const isEditMode = Boolean(id);
	const fileInputRef = useRef(null);
	const [showGoogleMaps, setShowGoogleMaps] = useState(false);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		location: "",
		locationUrl: "",
		cause: "",
		max_volunteers: 10,
		status: "active",

		// Single event fields
		date: "",
		start_time: "",
		end_time: "",

		// Recurring event fields
		is_recurring: false,
		recurrence_pattern: "weekly",
		recurrence_days: [1], // Default to Monday
		recurrence_start_date: "",
		recurrence_end_date: "",
		recurrence_time_start: "09:00",
		recurrence_time_end: "12:00",
	});

	const [imageFile, setImageFile] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [currentImageUrl, setCurrentImageUrl] = useState(null);
	const [loading, setLoading] = useState(isEditMode);
	const [error, setError] = useState(null);
	const [submitLoading, setSubmitLoading] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const handleLocationData = (locationData) => {
		if (locationData && locationData.length > 0) {
			const selectedLocation = locationData[0];
			console.log(selectedLocation);
			setFormData({
				...formData,
				location: selectedLocation.address || selectedLocation.name,
				locationUrl: selectedLocation.locationUrl,
				latitude: selectedLocation.latitude,
				longitude: selectedLocation.longitude
			});
		}
	};

	useEffect(() => {
		if (isEditMode) {
			// Fetch event data for editing
			const fetchEventDetails = async () => {
				try {
					const response = await Api.getEvent(id);
					const eventData = await response.json();
					console.log("Fetched event data:", eventData);

					// Check if event is completed and redirect if it is
					if (eventData.status === "completed") {
						setError("Completed events cannot be edited.");
						setTimeout(() => {
							navigate(`/organizer/events/${id}`);
						}, 2000);
						return;
					}

					// Set current image URL if exists
					if (eventData.image_url) {
						setCurrentImageUrl(eventData.image_url);
						setImagePreview(eventData.image_url);
					}

					// Handle dates and times based on event type
					let date = "";
					let startTime = "";
					let endTime = "";
					let isRecurring = eventData.is_recurring || false;
					let recurrenceData = {};

					// For single events
					if (!isRecurring && eventData.start_datetime) {
						const startDateTime = new Date(
							eventData.start_datetime
						);
						date = startDateTime.toISOString().split("T")[0];
						startTime = startDateTime.toTimeString().slice(0, 5);

						if (eventData.end_datetime) {
							const endDateTime = new Date(
								eventData.end_datetime
							);
							endTime = endDateTime.toTimeString().slice(0, 5);
						}
					}

					// For recurring events
					if (isRecurring) {
						recurrenceData = {
							recurrence_pattern:
								eventData.recurrence_pattern || "weekly",
							recurrence_days: eventData.recurrence_days || [1],
							recurrence_start_date:
								eventData.recurrence_start_date
									? new Date(eventData.recurrence_start_date)
											.toISOString()
											.split("T")[0]
									: "",
							recurrence_end_date: eventData.recurrence_end_date
								? new Date(eventData.recurrence_end_date)
										.toISOString()
										.split("T")[0]
								: "",
							recurrence_time_start:
								eventData.recurrence_time?.start || "09:00",
							recurrence_time_end:
								eventData.recurrence_time?.end || "12:00",
						};
					}

					// Update form with event data
					setFormData({
						name: eventData.name || "",
						description: eventData.description || "",
						date: date,
						start_time: startTime,
						end_time: endTime,
						location: eventData.location || "",
						locationUrl: eventData.locationUrl || "",
						cause:
							eventData.causes && eventData.causes.length > 0
								? eventData.causes[0]
								: "",
						max_volunteers: eventData.max_volunteers || 10,
						status: eventData.status || "active",
						is_recurring: isRecurring,
						...recurrenceData,
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
	}, [id, isEditMode, navigate]);

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

	const handleRecurringToggle = (checked) => {
		setFormData({
			...formData,
			is_recurring: checked,
		});
	};

	const handleDayToggle = (day, checked) => {
		const currentDays = [...formData.recurrence_days];

		if (checked) {
			// Add the day if not present
			if (!currentDays.includes(day)) {
				currentDays.push(day);
			}
		} else {
			// Remove the day
			const index = currentDays.indexOf(day);
			if (index !== -1) {
				currentDays.splice(index, 1);
			}
		}

		// Ensure at least one day is selected
		if (currentDays.length > 0 || !checked) {
			setFormData({
				...formData,
				recurrence_days: currentDays.sort((a, b) => a - b), // Sort numerically
			});
		}
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		// Check file type
		const validTypes = [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/gif",
			"image/webp",
		];
		if (!validTypes.includes(file.type)) {
			setError(
				"Please select a valid image file (JPEG, JPG, PNG, GIF, WEBP)"
			);
			return;
		}

		// Check file size (5MB max)
		if (file.size > 5 * 1024 * 1024) {
			setError("Image size should be less than 5MB");
			return;
		}

		setImageFile(file);

		// Create preview URL
		const reader = new FileReader();
		reader.onload = () => {
			setImagePreview(reader.result);
		};
		reader.readAsDataURL(file);
	};

	const triggerFileInput = () => {
		fileInputRef.current.click();
	};

	const removeImage = () => {
		setImageFile(null);
		setImagePreview(isEditMode ? currentImageUrl : null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitLoading(true);
		setError(null);

		try {
			// Prepare the data for submission
			const eventData = { ...formData };

			// Format the data differently based on whether it's recurring or not
			if (eventData.is_recurring) {
				// For recurring events, format the recurrence data
				eventData.recurrence_time = {
					start: eventData.recurrence_time_start,
					end: eventData.recurrence_time_end,
				};

				// Remove single event fields
				delete eventData.date;
				delete eventData.start_time;
				delete eventData.end_time;
			} else {
				// For single events, we need to reformat to match the expected backend format
				eventData.start_date = eventData.date;
				eventData.end_date = eventData.date; // Same date for non-recurring events

				// Remove date field as it's not expected by the backend
				delete eventData.date;

				// Remove recurring fields
				delete eventData.recurrence_pattern;
				delete eventData.recurrence_days;
				delete eventData.recurrence_start_date;
				delete eventData.recurrence_end_date;
				delete eventData.recurrence_time_start;
				delete eventData.recurrence_time_end;
			}

			// Fix the data format for causes
			eventData.causes = eventData.cause ? [eventData.cause] : [];
			delete eventData.cause;

			// Remove helper fields
			delete eventData.recurrence_time_start;
			delete eventData.recurrence_time_end;

			console.log("Submitting event data:", eventData);

			if (isEditMode) {
				// Update existing event
				const response = await Api.updateEvent(
					id,
					eventData,
					imageFile
				);

				if (response.ok) {
					navigate("/organizer");
				} else {
					const data = await response.json();
					setError(data.message || "Failed to update event");
				}
			} else {
				// Create new event
				const response = await Api.createEvent(eventData, imageFile);

				if (response.ok) {
					navigate("/organizer");
				} else {
					const data = await response.json();
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

	const handleDelete = async () => {
		try {
			setSubmitLoading(true);
			const response = await Api.deleteEvent(id);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to delete event");
			}

			// Redirect to events list
			navigate("/dashboard");
		} catch (err) {
			console.error("Error deleting event:", err);
			setError("Failed to delete event. Please try again.");
		} finally {
			setSubmitLoading(false);
			setShowDeleteConfirm(false);
		}
	};

	// Use the check-out endpoint to undo check-in
	const handleUndoCheckIn = async (registrationId) => {
		try {
			console.log(`Undoing check-in for registration ${registrationId}`);

			// Use the API method for check-out instead of direct PUT request
			const response = await Api.checkOutRegistration(registrationId);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to undo check-in");
			}

			console.log("Check-in status successfully reset");
			// Refresh the list after update
			await fetchVolunteers();
		} catch (err) {
			console.error("Error undoing check-in:", err);
			setError(
				"Failed to undo check-in: " + (err.message || "Unknown error")
			);
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
		<div className="container mx-auto py-6 px-4">
			{/* Add style tag for custom input styles */}
			<style>{customInputStyles}</style>

			<ContentHeader
				title={isEditMode ? "Edit Event" : "Create New Event"}
				links={[]}
			/>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
				{/* Left column - Event details */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>
								{isEditMode
									? "Edit Event Details"
									: "Create New Event"}
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
								{/* Hero section with event title and actions */}
								<div className="relative mb-8">
									<div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-lg opacity-90"></div>
									<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8">
										<div className="text-white mb-4 md:mb-0">
											<h1 className="text-3xl font-bold mb-2">
												{formData.name}
											</h1>
											<div className="flex items-center mb-2">
												<User className="h-5 w-5 mr-2" />
												<span className="opacity-90">
													Organizer
												</span>
											</div>
											<div className="flex gap-3 mt-3">
												<Badge
													className={
														formData.status ===
														"active"
															? "bg-green-500 hover:bg-green-600 text-white"
															: formData.status ===
															  "draft"
															? "bg-amber-500 hover:bg-amber-600 text-white"
															: formData.status ===
															  "cancelled"
															? "bg-red-500 hover:bg-red-600 text-white"
															: "bg-gray-500 hover:bg-gray-600 text-white"
													}
												>
													{formData.status.toUpperCase()}
												</Badge>

												{formData.is_recurring && (
													<Badge className="bg-purple-500 hover:bg-purple-600 text-white">
														<RepeatIcon className="h-3 w-3 mr-1" />{" "}
														RECURRING
													</Badge>
												)}
											</div>
										</div>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="name">Event Title</Label>
									<Input
										id="name"
										name="name"
										placeholder="Enter event title"
										value={formData.name}
										onChange={handleChange}
										required
										className="custom-input"
									/>
								</div>

								<div className="space-y-2">
									<h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
										<FileText className="mr-2 h-5 w-5 text-indigo-600" />{" "}
										Description
									</h3>
									<Textarea
										id="description"
										name="description"
										rows="3"
										placeholder="Event description"
										value={formData.description}
										onChange={handleChange}
										required
										className="custom-input"
									/>
								</div>

								{/* Event Type Selection */}
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Checkbox
											id="is_recurring"
											checked={formData.is_recurring}
											onCheckedChange={
												handleRecurringToggle
											}
										/>
										<Label
											htmlFor="is_recurring"
											className="cursor-pointer"
										>
											This is a recurring event
										</Label>
									</div>
									<p className="text-sm text-gray-500">
										{formData.is_recurring
											? "This event repeats on a regular schedule"
											: "This is a one-time event"}
									</p>
								</div>

								{/* Conditional fields based on event type */}
								{formData.is_recurring ? (
									// Recurring Event Fields
									<>
										<div className="space-y-2">
											<Label htmlFor="recurrence_pattern">
												Recurrence Pattern
											</Label>
											<Select
												value={
													formData.recurrence_pattern
												}
												onValueChange={(value) =>
													handleSelectChange(
														"recurrence_pattern",
														value
													)
												}
											>
												<SelectTrigger id="recurrence_pattern">
													<SelectValue placeholder="Select pattern" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="daily">
														Daily
													</SelectItem>
													<SelectItem value="weekly">
														Weekly
													</SelectItem>
													<SelectItem value="monthly">
														Monthly
													</SelectItem>
													<SelectItem value="custom">
														Custom
													</SelectItem>
												</SelectContent>
											</Select>
										</div>

										{/* Only show days selection for weekly or custom patterns */}
										{(formData.recurrence_pattern ===
											"weekly" ||
											formData.recurrence_pattern ===
												"custom") && (
											<div className="space-y-2">
												<Label>Recurring Days</Label>
												<div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
													{DAYS_OF_WEEK.map((day) => (
														<div
															key={day.value}
															className="flex items-center gap-2"
														>
															<Checkbox
																id={`day-${day.value}`}
																checked={formData.recurrence_days.includes(
																	day.value
																)}
																onCheckedChange={(
																	checked
																) =>
																	handleDayToggle(
																		day.value,
																		checked
																	)
																}
															/>
															<Label
																htmlFor={`day-${day.value}`}
																className="text-sm font-normal cursor-pointer"
															>
																{day.label}
															</Label>
														</div>
													))}
												</div>
											</div>
										)}

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="recurrence_start_date">
													Start Date
												</Label>
												<Input
													id="recurrence_start_date"
													name="recurrence_start_date"
													type="date"
													value={
														formData.recurrence_start_date
													}
													onChange={handleChange}
													required={
														formData.is_recurring
													}
													className="custom-input cursor-pointer"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="recurrence_end_date">
													End Date
												</Label>
												<Input
													id="recurrence_end_date"
													name="recurrence_end_date"
													type="date"
													value={
														formData.recurrence_end_date
													}
													onChange={handleChange}
													required={
														formData.is_recurring
													}
													className="custom-input cursor-pointer"
												/>
											</div>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="recurrence_time_start">
													Start Time
												</Label>
												<Input
													id="recurrence_time_start"
													name="recurrence_time_start"
													type="time"
													value={
														formData.recurrence_time_start
													}
													onChange={handleChange}
													required
													className="custom-input cursor-pointer"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="recurrence_time_end">
													End Time
												</Label>
												<Input
													id="recurrence_time_end"
													name="recurrence_time_end"
													type="time"
													value={
														formData.recurrence_time_end
													}
													onChange={handleChange}
													required
													className="custom-input cursor-pointer"
												/>
											</div>
										</div>
									</>
								) : (
									// Single Event Fields
									<>
										<div className="space-y-2">
											<Label htmlFor="date">Date</Label>
											<Input
												id="date"
												name="date"
												type="date"
												value={formData.date}
												onChange={handleChange}
												required
												className="custom-input cursor-pointer"
											/>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="start_time">
													Start Time
												</Label>
												<Input
													id="start_time"
													name="start_time"
													type="time"
													value={formData.start_time}
													onChange={handleChange}
													required
													className="custom-input cursor-pointer"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="end_time">
													End Time
												</Label>
												<Input
													id="end_time"
													name="end_time"
													type="time"
													value={formData.end_time}
													onChange={handleChange}
													required
													className="custom-input cursor-pointer"
												/>
											</div>
										</div>
									</>
								)}

								<div className="space-y-2">
									<Label htmlFor="location">Location</Label>
									<div className="relative">
										<Input
											id="location"
											name="location"
											placeholder="Click to select location from map"
											value={formData.location}
											onChange={handleChange}
											onClick={() =>
												setShowGoogleMaps(true)
											}
											required
											className="cursor-pointer pr-10"
										/>
										<MapPinIcon
											className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
											onClick={() =>
												setShowGoogleMaps(true)
											}
										/>
									</div>
									<p className="text-xs text-gray-500">
										Click on the input or map icon to select
										a location
									</p>
								</div>
								{formData.locationUrl && (
									<div className="location-url">
										<a
											href={formData.locationUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
										>
											<MapPinIcon className="h-4 w-4 mr-1" />
											View on Google Maps
										</a>
									</div>
								)}
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
												<div className="flex items-center">
													<div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
													Education
												</div>
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
										className="custom-input"
									/>
								</div>

								{isEditMode && (
									<div className="space-y-2">
										<Label htmlFor="status">Status</Label>
										<Select
											value={formData.status}
											onValueChange={(value) =>
												handleSelectChange(
													"status",
													value
												)
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

								{/* Action buttons - moved to the bottom of the form */}
								<div className="flex flex-col sm:flex-row gap-3 pt-6">
									<Button
										variant="outline"
										type="button"
										asChild
										className="order-3 sm:order-1"
									>
										<Link to="/organizer">Cancel</Link>
									</Button>

									<Button
										type="submit"
										variant="outline"
										disabled={submitLoading}
										className="order-1 sm:order-2 border-black"
									>
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

									{isEditMode && (
										<Button
											variant="outline"
											type="button"
											onClick={() =>
												setShowDeleteConfirm(true)
											}
											disabled={submitLoading}
											className="flex items-center gap-1 order-2 sm:order-3 bg-red-500 hover:bg-red-600 text-white hover:text-white"
										>
											{submitLoading ? (
												<AlertCircle className="h-4 w-4 animate-spin" />
											) : (
												<Trash className="h-4 w-4" />
											)}
											Delete
										</Button>
									)}
								</div>
							</form>
						</CardContent>
					</Card>
				</div>

				{/* Right column - Event image and preview */}
				<div className="lg:col-span-1">
					<Card className="shadow-md border-0 overflow-hidden mb-6">
						<CardHeader className="bg-indigo-500 text-white pb-2 pt-4">
							<CardTitle className="text-lg font-medium">
								Event Image
							</CardTitle>
						</CardHeader>
						<CardContent className="p-4">
							{/* Image Preview */}
							{imagePreview ? (
								<div className="relative mb-4">
									<img
										src={imagePreview}
										alt={formData.name || "Event preview"}
										className="w-full aspect-video object-cover rounded-md shadow-sm"
									/>
									<Button
										type="button"
										variant="destructive"
										size="sm"
										className="absolute top-2 right-2 opacity-90 hover:opacity-100"
										onClick={removeImage}
									>
										<Trash className="h-4 w-4" />
									</Button>
								</div>
							) : (
								<div
									className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 rounded-md p-8 mb-4 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer aspect-video"
									onClick={triggerFileInput}
								>
									<Upload className="h-10 w-10 text-indigo-400 mb-2" />
									<p className="text-indigo-600 font-medium">
										Click to upload an image
									</p>
									<p className="text-indigo-400 text-sm mt-1 text-center">
										High-quality images attract more
										volunteers
									</p>
								</div>
							)}

							{/* Hidden file input */}
							<input
								ref={fileInputRef}
								type="file"
								className="hidden"
								onChange={handleImageChange}
								accept="image/jpeg,image/png,image/gif,image/webp"
							/>

							{/* Only show this button if there's already an image */}
							{imagePreview && (
								<Button
									type="button"
									variant="outline"
									onClick={triggerFileInput}
									className="w-full flex items-center justify-center gap-2 mt-2 bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100"
								>
									<Upload className="h-4 w-4" />
									Change Image
								</Button>
							)}

							<p className="text-sm text-gray-500 mt-3">
								Recommended size: 1200x800px. Max size: 5MB.
								Supported formats: JPEG, PNG, GIF, WEBP.
							</p>
						</CardContent>
					</Card>

					{/* Event registration stats card */}
					<Card className="shadow-md border-0 overflow-hidden">
						<CardHeader className="bg-amber-500 text-white pb-2 pt-4">
							<CardTitle className="text-lg font-medium">
								Event Status
							</CardTitle>
						</CardHeader>
						<CardContent className="p-4">
							<div className="space-y-3">
								<div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
									<span className="text-gray-700">
										Event Type
									</span>
									<Badge
										className={
											formData.is_recurring
												? "bg-purple-100 text-purple-800 hover:bg-purple-200"
												: "bg-blue-100 text-blue-800 hover:bg-blue-200"
										}
									>
										{formData.is_recurring
											? "RECURRING"
											: "ONE-TIME"}
									</Badge>
								</div>

								<div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
									<span className="text-gray-700">
										Volunteer Slots
									</span>
									<span className="font-medium text-amber-700">
										{formData.max_volunteers}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<Dialog
				open={showDeleteConfirm}
				onOpenChange={setShowDeleteConfirm}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-red-600 flex items-center gap-2">
							<XCircle className="h-5 w-5" /> Confirm Event
							Deletion
						</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this event? This
							action cannot be undone.
							{event?.remainingSlots !== event?.totalSlots && (
								<div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
									<p className="text-red-600 font-semibold flex items-center">
										<AlertCircle className="h-4 w-4 mr-2" />
										Warning: This event has{" "}
										<span className="mx-1 text-red-700">
											{event?.totalSlots -
												event?.remainingSlots}
										</span>
										volunteer(s) registered. Deleting it
										will cancel all registrations.
									</p>
								</div>
							)}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowDeleteConfirm(false)}
						>
							Cancel
						</Button>
						<Button 
							variant="outline" 
							onClick={handleDelete}
							className="bg-red-500 hover:bg-red-600 text-white hover:text-white"
						>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<GoogleMaps
				trigger={showGoogleMaps}
				setTrigger={setShowGoogleMaps}
				extractData={handleLocationData}
			/>
		</div>
	);
}

export default OrganizerManageEvent;
