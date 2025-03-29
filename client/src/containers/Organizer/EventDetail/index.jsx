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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	CalendarIcon,
	CheckCircleIcon,
	DownloadIcon,
	MapPinIcon,
	PencilIcon,
	PlusIcon,
	SearchIcon,
	UsersIcon,
	XCircleIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ContentHeader from "../../../components/ContentHeader";
import { useAuth } from "../../../contexts/AuthContext";

function OrganizerEventDetail() {
	const { eventId } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [event, setEvent] = useState(null);
	const [editedEvent, setEditedEvent] = useState(null);
	const [participants, setParticipants] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isEditing, setIsEditing] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [activeTab, setActiveTab] = useState("details");

	// Fetch event data
	useEffect(() => {
		const fetchEventDetails = async () => {
			setLoading(true);

			try {
				// In a real implementation, use your Api helper
				// const response = await Api.getEvent(eventId);
				// const data = await response.json();

				// For demo purposes, we'll use mock data
				setTimeout(() => {
					const mockEvent = {
						id: parseInt(eventId),
						title: "Community Garden Cleanup Initiative",
						organizer: "Green Earth Association",
						date: "Every Saturday, 9:00 AM - 12:00 PM",
						specificDates: [
							"Sat, Apr 05, 2025",
							"Sat, Apr 12, 2025",
							"Sat, Apr 19, 2025",
						],
						location: "Community Garden, 123 Green Street",
						category: "Environment",
						tags: ["Environment", "Community service", "Gardening"],
						remainingSlots: 8,
						totalSlots: 25,
						description:
							"Join us in beautifying our community garden! This event focuses on cleaning up garden beds, removing weeds, planting new flowers and vegetables, and maintaining the garden infrastructure.",
						requirements: [
							"No experience necessary - we'll teach you!",
							"Wear comfortable clothes that can get dirty",
							"Bring water and sun protection",
							"Must be able to bend, stoop, and lift up to 10 pounds",
						],
						responsibilities: [
							"Help with weeding and mulching garden beds",
							"Assist with planting seasonal vegetables and flowers",
							"Participate in general cleanup of the garden area",
							"Help maintain garden tools and equipment",
						],
						contactPerson: "Maria Chen",
						contactEmail: "maria@greenearth.org",
						imageUrl: "/src/assets/tuition-volunteer.jpg",
						status: "active",
					};

					setEvent(mockEvent);
					setEditedEvent(mockEvent);

					const mockParticipants = [
						{
							id: 1,
							name: "John Smith",
							email: "john.smith@example.com",
							phone: "9123 4567",
							registrationDate: "2025-03-01T09:30:00",
							status: "confirmed",
						},
						{
							id: 2,
							name: "Emily Wong",
							email: "emily.wong@example.com",
							phone: "9876 5432",
							registrationDate: "2025-03-02T14:15:00",
							status: "confirmed",
						},
						{
							id: 3,
							name: "Michael Rodriguez",
							email: "michael.r@example.com",
							phone: "9111 2222",
							registrationDate: "2025-03-04T10:45:00",
							status: "pending",
						},
						{
							id: 4,
							name: "Sarah Johnson",
							email: "sarah.j@example.com",
							phone: "9555 7777",
							registrationDate: "2025-03-05T16:20:00",
							status: "confirmed",
						},
						{
							id: 5,
							name: "David Lee",
							email: "david.lee@example.com",
							phone: "9888 4444",
							registrationDate: "2025-03-07T11:10:00",
							status: "waitlist",
						},
					];

					setParticipants(mockParticipants);
					setLoading(false);
				}, 800);
			} catch (error) {
				console.error("Error fetching event details:", error);
				setLoading(false);
			}
		};

		fetchEventDetails();
	}, [eventId]);

	// Edit Mode
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

	const confirmSaveChanges = () => {
		// Would be API call in real implementation
		setTimeout(() => {
			setEvent(editedEvent);
			setIsEditing(false);
			setShowConfirmModal(false);
			setSaveSuccess(true);

			setTimeout(() => {
				setSaveSuccess(false);
			}, 3000);
		}, 800);
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleString();
	};

	const downloadParticipantsCSV = () => {
		const headers = [
			"ID",
			"Name",
			"Email",
			"Phone",
			"Registration Date",
			"Status",
		];
		const csvRows = [
			headers.join(","),
			...participants.map((p) => {
				return [
					p.id,
					`"${p.name}"`,
					`"${p.email}"`,
					`"${p.phone}"`,
					new Date(p.registrationDate).toLocaleString(),
					p.status,
				].join(",");
			}),
		];

		const csvData = csvRows.join("\n");

		// Create download link
		const blob = new Blob([csvData], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.setAttribute("hidden", "");
		a.setAttribute("href", url);
		a.setAttribute("download", `participants_event_${eventId}.csv`);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	// Filter participants based on search and status filter
	const filteredParticipants = participants.filter((participant) => {
		const matchesSearch =
			participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			participant.email
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			participant.phone.includes(searchTerm);

		const matchesStatus =
			statusFilter === "all" || participant.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	if (loading) {
		return (
			<div className="flex justify-center py-12">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
				<p className="ml-3 text-lg">Loading event details...</p>
			</div>
		);
	}

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
					{ to: "/events/organizer", label: "My Events" },
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

			{/* Main content with tabs */}
			<Tabs
				defaultValue="details"
				value={activeTab}
				onValueChange={setActiveTab}
				className="mb-6"
			>
				<TabsList className="w-full border-b grid grid-cols-4 rounded-none bg-transparent p-0">
					<TabsTrigger
						value="details"
						className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary font-medium text-gray-600 py-3 px-4"
					>
						Event Details
					</TabsTrigger>
					<TabsTrigger
						value="participants"
						className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary font-medium text-gray-600 py-3 px-4"
					>
						Participants
					</TabsTrigger>
					<TabsTrigger
						value="stats"
						className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary font-medium text-gray-600 py-3 px-4"
					>
						Analytics
					</TabsTrigger>
					<TabsTrigger
						value="messages"
						className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary font-medium text-gray-600 py-3 px-4"
					>
						Messages
					</TabsTrigger>
				</TabsList>

				<TabsContent value="details" className="p-0 border-none">
					<Card className="mb-6 shadow-sm">
						<CardContent className="p-6">
							{isEditing ? (
								/* Edit mode */
								<div className="space-y-6">
									<div>
										<Label htmlFor="title">
											Event Title
										</Label>
										<Input
											id="title"
											value={editedEvent.title}
											onChange={(e) =>
												handleEditField(
													"title",
													e.target.value
												)
											}
											className="mt-1"
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<Label htmlFor="organizer">
												Organizer
											</Label>
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
											<Label htmlFor="category">
												Category
											</Label>
											<Select
												value={editedEvent.category}
												onValueChange={(value) =>
													handleEditField(
														"category",
														value
													)
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
												handleEditField(
													"date",
													e.target.value
												)
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
																	e.target
																		.value
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
													addArrayItem(
														"specificDates"
													)
												}
												className="mt-2"
											>
												<PlusIcon className="h-4 w-4 mr-1" />{" "}
												Add Date
											</Button>
										</div>
									</div>

									<div>
										<Label htmlFor="location">
											Location
										</Label>
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
										<Label htmlFor="description">
											Description
										</Label>
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
												value={
													editedEvent.remainingSlots
												}
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
											{editedEvent.tags.map(
												(tag, index) => (
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
																	e.target
																		.value
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
												)
											)}
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													addArrayItem("tags")
												}
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
																	e.target
																		.value
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
															value={
																responsibility
															}
															onChange={(e) =>
																handleArrayField(
																	"responsibilities",
																	index,
																	e.target
																		.value
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
													addArrayItem(
														"responsibilities"
													)
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
												value={
													editedEvent.contactPerson
												}
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
										<Label htmlFor="status">
											Event Status
										</Label>
										<Select
											value={editedEvent.status}
											onValueChange={(value) =>
												handleEditField("status", value)
											}
										>
											<SelectTrigger
												id="status"
												className="mt-1"
											>
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
											src={event.imageUrl}
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
													of {event.totalSlots} spots
													filled
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
											{event.specificDates.map(
												(date, index) => (
													<li
														key={index}
														className="flex items-baseline"
													>
														<span className="text-primary mr-2">
															•
														</span>
														{date}
													</li>
												)
											)}
										</ul>
									</div>

									{/* Requirements */}
									<div className="mb-6">
										<h3 className="text-lg font-semibold mb-2">
											Volunteer Requirements
										</h3>
										<ul className="list-disc pl-5 space-y-1">
											{event.requirements.map(
												(req, index) => (
													<li
														key={index}
														className="text-gray-700"
													>
														{req}
													</li>
												)
											)}
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
				</TabsContent>

				<TabsContent value="participants" className="p-0 border-none">
					<Card className="shadow-sm">
						<CardContent className="p-6">
							<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
								<h3 className="text-lg font-semibold mb-2 sm:mb-0">
									Registered Participants
								</h3>
								<Button
									variant="outline"
									size="sm"
									onClick={downloadParticipantsCSV}
									className="flex items-center"
								>
									<DownloadIcon className="h-4 w-4 mr-1" />{" "}
									Export CSV
								</Button>
							</div>

							{/* Search and filters */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<SearchIcon className="h-4 w-4 text-gray-400" />
									</div>
									<Input
										type="text"
										placeholder="Search by name, email or phone..."
										value={searchTerm}
										onChange={(e) =>
											setSearchTerm(e.target.value)
										}
										className="pl-10"
									/>
								</div>
								<div className="flex items-center">
									<span className="mr-2 text-gray-600">
										Status:
									</span>
									<Select
										value={statusFilter}
										onValueChange={setStatusFilter}
									>
										<SelectTrigger className="w-[200px]">
											<SelectValue placeholder="Filter by status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">
												All
											</SelectItem>
											<SelectItem value="confirmed">
												Confirmed
											</SelectItem>
											<SelectItem value="pending">
												Pending
											</SelectItem>
											<SelectItem value="waitlist">
												Waitlist
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							{/* Participants count and table */}
							<p className="text-sm text-gray-500 mb-3">
								Showing {filteredParticipants.length} of{" "}
								{participants.length} participants
							</p>

							<div className="border rounded-md">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Name</TableHead>
											<TableHead>Email</TableHead>
											<TableHead>Phone</TableHead>
											<TableHead>
												Registration Date
											</TableHead>
											<TableHead>Status</TableHead>
											<TableHead className="text-right">
												Actions
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredParticipants.length > 0 ? (
											filteredParticipants.map(
												(participant) => (
													<TableRow
														key={participant.id}
													>
														<TableCell className="font-medium">
															{participant.name}
														</TableCell>
														<TableCell>
															{participant.email}
														</TableCell>
														<TableCell>
															{participant.phone}
														</TableCell>
														<TableCell>
															{formatDate(
																participant.registrationDate
															)}
														</TableCell>
														<TableCell>
															<Badge
																className={
																	participant.status ===
																	"confirmed"
																		? "bg-green-100 text-green-800"
																		: participant.status ===
																		  "pending"
																		? "bg-yellow-100 text-yellow-800"
																		: "bg-gray-100 text-gray-800"
																}
															>
																{
																	participant.status
																}
															</Badge>
														</TableCell>
														<TableCell className="text-right">
															<div className="relative">
																<Select>
																	<SelectTrigger className="h-8 w-24">
																		<SelectValue placeholder="Actions" />
																	</SelectTrigger>
																	<SelectContent>
																		<SelectItem value="email">
																			<a
																				href={`mailto:${participant.email}`}
																				className="flex w-full"
																			>
																				Email
																				Participant
																			</a>
																		</SelectItem>
																		<SelectItem value="profile">
																			View
																			Profile
																		</SelectItem>
																		{participant.status !==
																			"confirmed" && (
																			<SelectItem
																				value="confirm"
																				className="text-green-600"
																			>
																				<CheckCircleIcon className="h-4 w-4 mr-1 inline" />{" "}
																				Confirm
																			</SelectItem>
																		)}
																		{participant.status !==
																			"waitlist" && (
																			<SelectItem
																				value="waitlist"
																				className="text-amber-600"
																			>
																				Move
																				to
																				Waitlist
																			</SelectItem>
																		)}
																		<SelectItem
																			value="remove"
																			className="text-red-600"
																		>
																			<XCircleIcon className="h-4 w-4 mr-1 inline" />{" "}
																			Remove
																		</SelectItem>
																	</SelectContent>
																</Select>
															</div>
														</TableCell>
													</TableRow>
												)
											)
										) : (
											<TableRow>
												<TableCell
													colSpan="6"
													className="text-center py-6 text-gray-500"
												>
													No participants match your
													search criteria
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="stats" className="p-0 border-none">
					<Card className="shadow-sm">
						<CardContent className="p-6">
							<h3 className="text-lg font-semibold mb-6">
								Event Statistics
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
								<Card className="border bg-white shadow-sm">
									<CardContent className="p-6 text-center">
										<h4 className="text-sm font-medium text-gray-600 mb-2">
											Registration Rate
										</h4>
										<div className="text-4xl font-bold text-primary mb-2">
											{Math.round(
												((event.totalSlots -
													event.remainingSlots) /
													event.totalSlots) *
													100
											)}
											%
										</div>
										<p className="text-sm text-gray-500">
											{event.totalSlots -
												event.remainingSlots}{" "}
											of {event.totalSlots} slots filled
										</p>
										<div className="w-full bg-gray-200 rounded-full h-2 mt-4">
											<div
												className="bg-primary h-2 rounded-full"
												style={{
													width: `${
														((event.totalSlots -
															event.remainingSlots) /
															event.totalSlots) *
														100
													}%`,
												}}
											></div>
										</div>
									</CardContent>
								</Card>

								<Card className="border bg-white shadow-sm">
									<CardContent className="p-6 text-center">
										<h4 className="text-sm font-medium text-gray-600 mb-4">
											Status Distribution
										</h4>
										<div className="space-y-3">
											<div>
												<div className="flex justify-between mb-1 text-sm">
													<span>Confirmed</span>
													<span className="font-medium">
														{
															participants.filter(
																(p) =>
																	p.status ===
																	"confirmed"
															).length
														}
													</span>
												</div>
												<div className="w-full bg-gray-200 rounded-full h-2">
													<div
														className="bg-green-500 h-2 rounded-full"
														style={{
															width: `${
																(participants.filter(
																	(p) =>
																		p.status ===
																		"confirmed"
																).length /
																	participants.length) *
																100
															}%`,
														}}
													></div>
												</div>
											</div>

											<div>
												<div className="flex justify-between mb-1 text-sm">
													<span>Pending</span>
													<span className="font-medium">
														{
															participants.filter(
																(p) =>
																	p.status ===
																	"pending"
															).length
														}
													</span>
												</div>
												<div className="w-full bg-gray-200 rounded-full h-2">
													<div
														className="bg-yellow-500 h-2 rounded-full"
														style={{
															width: `${
																(participants.filter(
																	(p) =>
																		p.status ===
																		"pending"
																).length /
																	participants.length) *
																100
															}%`,
														}}
													></div>
												</div>
											</div>

											<div>
												<div className="flex justify-between mb-1 text-sm">
													<span>Waitlist</span>
													<span className="font-medium">
														{
															participants.filter(
																(p) =>
																	p.status ===
																	"waitlist"
															).length
														}
													</span>
												</div>
												<div className="w-full bg-gray-200 rounded-full h-2">
													<div
														className="bg-gray-500 h-2 rounded-full"
														style={{
															width: `${
																(participants.filter(
																	(p) =>
																		p.status ===
																		"waitlist"
																).length /
																	participants.length) *
																100
															}%`,
														}}
													></div>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card className="border bg-white shadow-sm">
									<CardContent className="p-6 text-center">
										<h4 className="text-sm font-medium text-gray-600 mb-4">
											Registration Timeline
										</h4>
										<div>
											<div className="text-xs text-gray-500 mb-1">
												Latest registration:
											</div>
											<div className="font-medium text-sm mb-4">
												{formatDate(
													participants.sort(
														(a, b) =>
															new Date(
																b.registrationDate
															) -
															new Date(
																a.registrationDate
															)
													)[0].registrationDate
												)}
											</div>
											<div className="text-xs text-gray-500 mb-1">
												First registration:
											</div>
											<div className="font-medium text-sm">
												{formatDate(
													participants.sort(
														(a, b) =>
															new Date(
																a.registrationDate
															) -
															new Date(
																b.registrationDate
															)
													)[0].registrationDate
												)}
											</div>
										</div>
									</CardContent>
								</Card>
							</div>

							<Card className="border bg-white shadow-sm mb-6">
								<CardContent className="p-6">
									<h4 className="text-sm font-medium text-gray-600 mb-3">
										Registration Activity
									</h4>
									<div className="p-12 bg-gray-50 rounded-md text-center">
										<p className="text-sm mb-1">
											Chart visualization would go here
										</p>
										<p className="text-xs text-gray-500">
											This area would display a chart
											showing registrations over time. You
											can implement this with Recharts.
										</p>
									</div>
								</CardContent>
							</Card>

							<Card className="border bg-white shadow-sm">
								<CardContent className="p-6">
									<h4 className="text-sm font-medium text-gray-600 mb-4">
										Engagement Metrics
									</h4>
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										<div className="text-center">
											<div className="text-2xl font-bold text-primary mb-1">
												14
											</div>
											<div className="text-xs text-gray-500">
												Page Views
											</div>
										</div>
										<div className="text-center">
											<div className="text-2xl font-bold text-primary mb-1">
												8
											</div>
											<div className="text-xs text-gray-500">
												Applications Started
											</div>
										</div>
										<div className="text-center">
											<div className="text-2xl font-bold text-primary mb-1">
												62%
											</div>
											<div className="text-xs text-gray-500">
												Completion Rate
											</div>
										</div>
										<div className="text-center">
											<div className="text-2xl font-bold text-primary mb-1">
												3
											</div>
											<div className="text-xs text-gray-500">
												Shares
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="messages" className="p-0 border-none">
					<Card className="shadow-sm">
						<CardContent className="p-6">
							<h3 className="text-lg font-semibold mb-6">
								Message Participants
							</h3>

							<div className="space-y-4">
								<div>
									<Label htmlFor="recipients">
										Recipients
									</Label>
									<Select>
										<SelectTrigger
											id="recipients"
											className="mt-1"
										>
											<SelectValue placeholder="Select recipients" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">
												All Participants
											</SelectItem>
											<SelectItem value="confirmed">
												Confirmed Participants
											</SelectItem>
											<SelectItem value="pending">
												Pending Participants
											</SelectItem>
											<SelectItem value="waitlist">
												Waitlist Participants
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="subject">Subject</Label>
									<Input
										id="subject"
										placeholder="Email subject"
										className="mt-1"
									/>
								</div>

								<div>
									<Label htmlFor="message">Message</Label>
									<Textarea
										id="message"
										rows={6}
										placeholder="Type your message here..."
										className="mt-1"
									/>
									<p className="text-xs text-gray-500 mt-1">
										You can use {"{name}"} to include the
										recipient's name in your message.
									</p>
								</div>

								<div className="flex items-center">
									<input
										type="checkbox"
										id="send-copy"
										className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
									/>
									<label
										htmlFor="send-copy"
										className="ml-2 text-sm text-gray-700"
									>
										Send a copy to myself
									</label>
								</div>

								<Button>Send Message</Button>
							</div>

							<div className="border-t border-gray-200 my-8 pt-6">
								<h3 className="text-lg font-semibold mb-4">
									Message History
								</h3>
								<div className="border rounded-md">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Date</TableHead>
												<TableHead>Subject</TableHead>
												<TableHead>
													Recipients
												</TableHead>
												<TableHead className="text-right">
													Actions
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											<TableRow>
												<TableCell>
													Mar 10, 2025
												</TableCell>
												<TableCell>
													Important Update: Location
													Change
												</TableCell>
												<TableCell>
													All Participants (5)
												</TableCell>
												<TableCell className="text-right">
													<Button
														variant="link"
														size="sm"
													>
														View
													</Button>
												</TableCell>
											</TableRow>
											<TableRow>
												<TableCell>
													Mar 05, 2025
												</TableCell>
												<TableCell>
													Welcome to our Garden
													Cleanup Event!
												</TableCell>
												<TableCell>
													Confirmed Participants (3)
												</TableCell>
												<TableCell className="text-right">
													<Button
														variant="link"
														size="sm"
													>
														View
													</Button>
												</TableCell>
											</TableRow>
										</TableBody>
									</Table>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

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
