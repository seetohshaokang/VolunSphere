// src/containers/EventDetail/index.jsx
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Share } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import Api from "../../../helpers/Api";

function EventDetail() {
	const { eventId } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [event, setEvent] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isRegistered, setIsRegistered] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [registrationSuccess, setRegistrationSuccess] = useState(false);
	const [error, setError] = useState(null);

	// Fetch event details
	useEffect(() => {
		const fetchEventDetails = async () => {
			setLoading(true);
			setError(null);

			try {
				// Using the Api helper to fetch event
				const response = await Api.getEvent(eventId);
				const eventData = await response.json();
				setEvent(eventData);

				// Check if user is logged in, fetch registration status
				if (user) {
					checkRegistrationStatus();
				}
			} catch (err) {
				console.error("Error fetching event details:", err);
				setError(
					"Failed to load event details. Please try again later."
				);
			} finally {
				setLoading(false);
			}
		};

		fetchEventDetails();
	}, [eventId, user]);

	// Check if user is already registered
	const checkRegistrationStatus = async () => {
		try {
			const response = await Api.getRegisteredEvents();
			const data = await response.json();

			// Check if this event is in the list of registrations
			const isUserRegistered = data.some(
				(registration) => registration.event_id === parseInt(eventId)
			);

			setIsRegistered(isUserRegistered);
		} catch (err) {
			console.error("Error checking registration status:", err);
			// Non-critical error, don't show to user
		}
	};

	const handleRegisterClick = () => {
		if (!user) {
			// Redirect to login if not logged in
			navigate("/login", { state: { from: `/events/${eventId}` } });
			return;
		}

		// Check if event is at capacity before showing confirmation modal
		if (
			event.max_volunteers > 0 &&
			(event.registered_count || 0) >= event.max_volunteers
		) {
			setError(
				"This event has reached maximum capacity. No more slots available."
			);
			return;
		}

		// Show confirmation modal
		setShowConfirmModal(true);
	};

	const confirmRegistration = async () => {
		try {
			await Api.registerForEvent(eventId);

			setIsRegistered(true);
			setShowConfirmModal(false);
			setRegistrationSuccess(true);

			// Update the event data to reflect the new registration count
			setEvent((prev) => ({
				...prev,
				registered_count: (prev.registered_count || 0) + 1,
			}));

			// Hide success message after 3 seconds
			setTimeout(() => {
				setRegistrationSuccess(false);
			}, 3000);
		} catch (err) {
			console.error("Error registering for event:", err);
			setError("Failed to register for event. Please try again.");
			setShowConfirmModal(false);
		}
	};

	const cancelRegistration = async () => {
		try {
			await Api.cancelEventRegistration(eventId);

			setIsRegistered(false);
			setShowConfirmModal(false);

			// Update the event data to reflect the reduced registration count
			setEvent((prev) => ({
				...prev,
				registered_count: Math.max(0, (prev.registered_count || 1) - 1),
			}));
		} catch (err) {
			console.error("Error cancelling registration:", err);
			setError("Failed to cancel registration. Please try again.");
		}
	};

	// Helper function to format date strings
	const formatDateRange = () => {
		if (event.start_date && event.end_date) {
			const startDate = new Date(event.start_date);
			const endDate = new Date(event.end_date);

			const options = {
				weekday: "short",
				year: "numeric",
				month: "short",
				day: "2-digit",
			};

			if (startDate.toDateString() === endDate.toDateString()) {
				return startDate.toLocaleDateString(undefined, options);
			} else {
				return `${startDate.toLocaleDateString(
					undefined,
					options
				)} - ${endDate.toLocaleDateString(undefined, options)}`;
			}
		}

		return "Date information unavailable";
	};

	if (loading) {
		return (
			<div className="flex justify-center py-12">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
				<p className="ml-3 text-lg">Loading event details...</p>
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive" className="my-6">
				<AlertDescription>{error}</AlertDescription>
			</Alert>
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
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-6">
			{/* Breadcrumb navigation */}
			<nav className="mb-5">
				<ol className="flex space-x-2 text-sm">
					<li>
						<a href="/" className="text-blue-600 hover:underline">
							Home
						</a>
					</li>
					<li className="flex items-center">
						<span className="mx-2 text-gray-400">/</span>
						<a
							href="/events"
							className="text-blue-600 hover:underline"
						>
							Volunteer
						</a>
					</li>
					<li className="flex items-center">
						<span className="mx-2 text-gray-400">/</span>
						<span className="text-gray-600">{event.name}</span>
					</li>
				</ol>
			</nav>

			{/* Event header */}
			<div className="relative mb-6">
				<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
					{event.name}
				</h1>
				<div className="flex items-center mb-4">
					<div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
					<span className="text-gray-700">
						{event.organiser_name || "Organization"}
					</span>
				</div>
				<div className="absolute top-0 right-0">
					<button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
						<Share className="h-4 w-4 mr-1" /> Share
					</button>
				</div>
			</div>

			{/* Registration success message */}
			{registrationSuccess && (
				<Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
					<AlertDescription>
						You have successfully registered for this event!
					</AlertDescription>
				</Alert>
			)}

			{/* Main content grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2">
					{/* Event image */}
					<div className="relative w-full h-96 mb-6 rounded-lg overflow-hidden shadow-md">
						<img
							src={
								event.image_url ||
								`https://source.unsplash.com/random/800x400/?${
									event.cause || "volunteer"
								}`
							}
							alt={event.name}
							className="w-full h-full object-cover"
						/>
					</div>

					{/* Event causes/tags */}
					<div className="mb-8">
						<h5 className="text-base font-semibold text-gray-600 mb-3">
							Supported causes
						</h5>
						<div className="flex flex-wrap gap-2">
							<span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-blue-50 text-blue-700">
								{event.cause}
							</span>
						</div>
					</div>

					{/* About the opportunity */}
					<div className="mb-10 pb-8 border-b border-gray-200">
						<h3 className="text-2xl font-semibold text-gray-800 mb-4">
							About the opportunity
						</h3>
						<p className="text-gray-700">{event.description}</p>

						<div className="mt-6 space-y-6">
							<div>
								<h5 className="text-base font-semibold text-gray-600 mb-2">
									Day and time of sessions
								</h5>
								<div className="flex flex-col sm:flex-row sm:gap-8">
									<div>
										<strong className="block mb-1">
											Date:
										</strong>
										<span>{formatDateRange()}</span>
									</div>
									{event.start_time && event.end_time && (
										<div>
											<strong className="block mb-1">
												Time:
											</strong>
											<span>
												{event.start_time} -{" "}
												{event.end_time}
											</span>
										</div>
									)}
								</div>
							</div>

							<div>
								<h5 className="text-base font-semibold text-gray-600 mb-2">
									Location
								</h5>
								<p>{event.location}</p>
							</div>

							{event.requirements && (
								<div>
									<h5 className="text-base font-semibold text-gray-600 mb-2">
										Basic requirements
									</h5>
									<ul className="list-disc pl-5 space-y-1">
										{event.requirements
											.split(",")
											.map((req, index) => (
												<li key={index}>
													{req.trim()}
												</li>
											))}
									</ul>
								</div>
							)}

							<div>
								<h5 className="text-base font-semibold text-gray-600 mb-2">
									For more information/questions, please
									contact:
								</h5>
								<p>
									{event.contact_person || "Contact person"}
									<br />
									{event.contact_email || "contact@email.com"}
								</p>
							</div>
						</div>
					</div>

					{/* Volunteer positions */}
					<div className="mb-10 pb-8 border-b border-gray-200">
						<h3 className="text-2xl font-semibold text-gray-800 mb-4">
							Volunteer positions
						</h3>
						<div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
							<div className="flex justify-between items-center mb-3">
								<h4 className="text-lg font-semibold text-gray-800">
									Volunteer
								</h4>
								<span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
									{event.max_volunteers
										? `${
												event.max_volunteers -
												(event.registered_count || 0)
										  } of ${
												event.max_volunteers
										  } slots left`
										: "Open registration (no slot limit)"}
								</span>
							</div>
							<div>
								<p className="text-gray-700">
									{event.responsibilities
										? event.responsibilities.split(",")[0]
										: "Help support this event as a volunteer"}
								</p>
							</div>
						</div>
					</div>

					{/* About the organization */}
					<div className="mb-10">
						<h3 className="text-2xl font-semibold text-gray-800 mb-4">
							About the organisation
						</h3>
						<p className="text-gray-700 mb-4">
							{event.org_description ||
								"Founded in June 2017, Happy Children Happy Future (HCHF) is a initiative committed to transforming the lives of Primary 1 to Secondary 3 students from low-income or single-parent families. Through free tuition, we strive to close the education gap and open doors to brighter opportunities for these deserving children."}
						</p>

						<h4 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
							Why Your Support Matters
						</h4>
						<p className="text-gray-700 mb-4">
							Every child has the potential to thrive, but many
							face challenges that stand in their way—limited
							resources, restricted opportunities, and
							circumstances beyond their control. These struggles
							not only impact their academics but also their
							confidence and future possibilities.
						</p>

						<p className="text-gray-700 mb-4">
							At HCHF, we aim to change that story. With your
							help, we can bridge the educational gap, uplift
							young minds, and give these children the tools to
							overcome their hurdles.
						</p>

						<h4 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
							Join the Movement—Be Part of the Change
						</h4>
						<p className="text-gray-700 mb-4">
							As a volunteer, you're not just teaching; you're
							inspiring confidence, shaping futures, and building
							a better society for us all. Your time could be the
							catalyst that turns struggles into triumphs and
							dreams into realities.
						</p>

						<div className="my-8 p-5 bg-gray-50 border-l-4 border-blue-600 rounded-r-lg italic text-gray-600 text-center">
							✨ Volunteer with HCHF today—because every child
							deserves the chance to shine. ✨
						</div>
					</div>
				</div>

				{/* Sidebar with registration */}
				<div className="lg:sticky lg:top-24 lg:self-start">
					<div className="bg-white rounded-lg shadow-lg p-6">
						<div className="flex mb-5">
							<div className="text-2xl mr-3">📍</div>
							<div>
								<h5 className="font-semibold text-gray-700 mb-1">
									Location
								</h5>
								<p className="text-gray-800">
									{event.location}
								</p>
							</div>
						</div>

						<div className="flex mb-6">
							<div className="text-2xl mr-3">🗓️</div>
							<div>
								<h5 className="font-semibold text-gray-700 mb-1">
									Date and time
								</h5>
								<p className="text-gray-800">
									{formatDateRange()}
								</p>
								{event.start_time && event.end_time && (
									<p className="text-gray-800">
										<strong>Time: </strong>
										{event.start_time} - {event.end_time}
									</p>
								)}
							</div>
						</div>

						{isRegistered ? (
							<button
								onClick={() => setShowConfirmModal(true)}
								className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-md text-base font-medium transition-colors"
							>
								Cancel Registration
							</button>
						) : (
							<button
								onClick={handleRegisterClick}
								disabled={
									event.status !== "active" ||
									(event.max_volunteers > 0 &&
										(event.registered_count || 0) >=
											event.max_volunteers)
								}
								className={`w-full py-3 px-4 rounded-md text-base font-medium transition-colors ${
									event.status !== "active" ||
									(event.max_volunteers > 0 &&
										(event.registered_count || 0) >=
											event.max_volunteers)
										? "bg-gray-300 text-gray-500 cursor-not-allowed"
										: "bg-blue-600 hover:bg-blue-700 text-white"
								}`}
							>
								{event.status !== "active"
									? "Event Not Active"
									: event.max_volunteers > 0 &&
									  (event.registered_count || 0) >=
											event.max_volunteers
									? "No Spots Available"
									: "I want to volunteer"}
							</button>
						)}

						{event.max_volunteers > 0 && (
							<div className="mt-5 text-center text-gray-600">
								<p className="mb-2">
									<strong>
										{event.max_volunteers -
											(event.registered_count || 0)}
									</strong>{" "}
									of <strong>{event.max_volunteers}</strong>{" "}
									spots left
								</p>
								<div className="bg-gray-200 h-2 rounded-full overflow-hidden">
									<div
										className="bg-blue-600 h-full rounded-full"
										style={{
											width: `${
												((event.max_volunteers -
													(event.max_volunteers -
														(event.registered_count ||
															0))) /
													event.max_volunteers) *
												100
											}%`,
										}}
									></div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Confirmation Dialog */}
			<Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{isRegistered
								? "Cancel Registration"
								: "Confirm Registration"}
						</DialogTitle>
						<DialogDescription>
							{isRegistered ? (
								<p>
									Are you sure you want to cancel your
									registration for this event? This action
									cannot be undone.
								</p>
							) : (
								<>
									<p className="mb-2">
										You are about to register as a volunteer
										for:
									</p>
									<p className="font-semibold mb-2">
										{event.name}
									</p>
									<p className="mb-2">
										Please ensure you can commit to the
										following:
									</p>
									<ul className="list-disc pl-5 space-y-1 mb-4">
										{event.requirements ? (
											event.requirements
												.split(",")
												.map((req, index) => (
													<li key={index}>
														{req.trim()}
													</li>
												))
										) : (
											<li>
												Attending at the specified date
												and time
											</li>
										)}
									</ul>
									{event.is_recurring && (
										<p className="font-medium">
											<strong>Note:</strong> This is a
											recurring event. By registering, you
											are committing to attend all
											sessions within the specified date
											range.
										</p>
									)}
								</>
							)}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="sm:justify-end">
						<Button
							variant="outline"
							onClick={() => setShowConfirmModal(false)}
						>
							Cancel
						</Button>
						<Button
							variant={isRegistered ? "destructive" : "default"}
							onClick={
								isRegistered
									? cancelRegistration
									: confirmRegistration
							}
						>
							{isRegistered
								? "Confirm Cancellation"
								: "Confirm Registration"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default EventDetail;
