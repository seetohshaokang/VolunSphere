import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Eye, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ContentHeader from "../../../components/ContentHeader";
import NricUploader from "../../../components/NricUploader";
import { useAuth } from "../../../contexts/AuthContext";
import Api from "../../../helpers/Api";

function Profile() {
	const { user, logout, refreshProfile } = useAuth();
	const navigate = useNavigate();
	const [isEditing, setIsEditing] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);
	const [events, setEvents] = useState([]);
	const [profile, setProfile] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		dob: "",
		bio: "",
		avatar: null,
		avatarFile: null,
		skills: [],
		address: "",
	});

	const [nricFile, setNricFile] = useState(null);
	const [uploadingNric, setUploadingNric] = useState(false);

	// Add timestamp for cache busting
	const [imageTimestamp, setImageTimestamp] = useState(Date.now());

	// Format date for input field (YYYY-MM-DD)
	const formatDateForInput = (dateString) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toISOString().split("T")[0];
	};

	useEffect(() => {
		console.log("User data:", user);
		fetchUserProfile();
		fetchUserEvents();
	}, [user]);

	const fetchUserProfile = async () => {
		if (!user) return;

		setLoading(true);
		try {
			const response = await Api.getUserProfile({
				headers: {
					"Cache-Control": "no-cache",
					Pragma: "no-cache",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch profile data");
			}

			const data = await response.json();
			console.log("Profile data received:", data);
			console.log("NRIC data:", data.profile.nric_image);

			// Parse name (assuming it comes as full name)
			let firstName = data.profile.name || "";
			let lastName = "";

			if (firstName.includes(" ")) {
				const nameParts = firstName.split(" ");
				firstName = nameParts[0];
				lastName = nameParts.slice(1).join(" ");
			}

			// Log the avatar URL we're going to use
			console.log("Setting avatar to:", data.profile.profile_picture_url);

			setProfile({
				firstName,
				lastName,
				email: data.user.email || "Email not provided",
				phone: data.profile.phone || "",
				dob: data.profile.dob
					? formatDateForInput(data.profile.dob)
					: "",
				bio: data.profile.bio || data.profile.description || "",
				avatar: data.profile.profile_picture_url,
				address: data.profile.address || "",
				skills:
					data.profile.skills ||
					data.profile.volunteer_skills?.map(
						(skill) => skill.skill_name
					) ||
					[],
				nric_image: data.profile.nric_image || null,
			});
		} catch (err) {
			console.error("Error fetching profile:", err);
			setError("Failed to load profile data. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const fetchUserEvents = async () => {
		if (!user) {
			console.log("No user found, returning early.");
			return;
		}

		try {
			let response;
			if (user.role === "organiser") {
				console.log("Fetching organized events...");
				response = await Api.getOrganizedEvents();
			} else {
				console.log("Fetching registered events...");
				response = await Api.getRegisteredEvents();
			}

			if (!response.ok) {
				throw new Error(
					`Failed to fetch ${
						user.role === "organiser" ? "organized" : "registered"
					} events`
				);
			}

			const data = await response.json();
			console.log("Fetched event data:", data);

			// Now access the events array from the response object
			const events = data.events || [];

			// Check if the events array has any items
			if (events.length === 0) {
				console.log("No events found.");
				setEvents([]); // Set empty events if no events are found
			} else {
				setEvents(events);
			}
		} catch (err) {
			console.error("Error fetching events:", err);
			// Non-critical error, don't show to user
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setProfile({ ...profile, [name]: value });
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Create a preview URL for display purposes
			const imageUrl = URL.createObjectURL(file);
			setProfile({ ...profile, avatar: imageUrl, avatarFile: file });
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(null);

		try {
			// Create FormData for the API call
			const formData = new FormData();
			formData.append(
				"name",
				`${profile.firstName} ${profile.lastName}`.trim()
			);
			formData.append("phone", profile.phone);
			formData.append("bio", profile.bio);
			formData.append("dob", profile.dob);
			formData.append("address", profile.address);

			// Log what's in the FormData
			console.log("Preparing form data:", {
				name: `${profile.firstName} ${profile.lastName}`.trim(),
				phone: profile.phone,
				bio: profile.bio,
				dob: profile.dob,
				address: profile.address,
				hasAvatarFile: profile.avatarFile ? "Yes" : "No",
			});

			if (profile.avatarFile) {
				console.log(
					"Attaching profile picture file:",
					profile.avatarFile.name
				);
				formData.append("profile_picture", profile.avatarFile);
			}

			if (
				user.role === "volunteer" &&
				profile.skills &&
				profile.skills.length > 0
			) {
				formData.append("skills", JSON.stringify(profile.skills));
			}

			// This is a nested try block that can stay or be flattened
			const data = await Api.updateUserProfile(formData);
			console.log("API Response:", data);

			if (!data || !data.profile) {
				throw new Error("Failed to update profile");
			}

			setImageTimestamp(Date.now());
			setSuccess("Profile updated successfully!");
			setIsEditing(false);

			// Update the profile data in the auth context
			if (typeof refreshProfile === "function") {
				refreshProfile();
			}

			fetchUserProfile();
		} catch (err) {
			console.error("Error updating profile:", err);
			setError("Failed to update profile. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleNricFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setNricFile(file);
		}
	};

	const handleNricUpload = async () => {
		if (!nricFile) return;
		setUploadingNric(true);
		setError(null);
		setSuccess(null);

		try {
			// Create Form Data for the API call
			const formData = new FormData();
			formData.append("nric_image", nricFile);

			const response = await Api.uploadNRIC(formData);

			if (response.ok) {
				const data = await response.json();
				setSuccess(
					data.message ||
						"NRIC uploaded successfully. It will be verified by an adminstrator."
				);
				setNricFile(null);
				// Refresh profile data to show updated NRIC status
				fetchUserProfile();
			} else {
				const errorData = await response.json();
				setError(errorData.message || "Failed to upload NRIC");
			}
		} catch (err) {
			console.error("Error uploading NRIC:", err);
			setError("Failed to upload NRIC> Please try again.");
		} finally {
			setUploadingNric(false);
		}
	};

	if (loading && !profile.email) {
		return (
			<div className="min-h-screen flex justify-center items-center">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
					<div className="flex justify-center items-center h-64">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						<span className="ml-2">Loading profile...</span>
					</div>
				</div>
			</div>
		);
	}

	// Function to handle avatar URL with potential cache busting
	const getAvatarUrl = () => {
		if (!profile.avatar) {
			return user?.role === "organiser"
				? "/src/assets/default-avatar-red.png"
				: "/src/assets/default-avatar-blue.png";
		}

		// If it's a full URL
		if (profile.avatar.startsWith("http")) {
			return `${profile.avatar}?t=${imageTimestamp}`;
		}

		// If it's a relative path with a file extension
		if (profile.avatar.startsWith("/") || profile.avatar.includes(".")) {
			// Determine if it's a server-hosted image or a local asset
			if (
				profile.avatar.startsWith("/uploads/") ||
				profile.avatar.includes("profile-")
			) {
				return `http://localhost:8000${
					profile.avatar.startsWith("/") ? "" : "/uploads/profiles/"
				}${profile.avatar}?t=${imageTimestamp}`;
			}
			return `${profile.avatar}?t=${imageTimestamp}`;
		}

		// If it's just a filename (most likely from server)
		return `http://localhost:8000/uploads/profiles/${profile.avatar}?t=${imageTimestamp}`;
	};

	return (
		<div className="min-h-screen">
			{/* Main content container with width constraints matching main page */}
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
				<ContentHeader
					title="My Profile"
					links={[
						{ to: "/organizer", label: "Home" },
						{ label: "Profile", isActive: true },
					]}
					className="mt-8 mb-8"
				/>

				{error && (
					<Alert variant="destructive" className="mb-6">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{success && (
					<Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
						<AlertDescription>{success}</AlertDescription>
					</Alert>
				)}

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Card className="md:col-span-1">
						<CardContent className="p-6 flex flex-col items-center text-center">
							<Avatar className="w-24 h-24 border-4 border-primary">
								<AvatarImage
									src={getAvatarUrl()}
									alt="User profile"
								/>
								<AvatarFallback>
									{profile.firstName?.charAt(0) || ""}
									{profile.lastName?.charAt(0) || ""}
								</AvatarFallback>
							</Avatar>
							<h2 className="text-xl font-bold mt-4">
								{profile.firstName} {profile.lastName}
							</h2>
							<p className="text-sm text-muted-foreground">
								{user?.role === "volunteer"
									? "Volunteer"
									: "Event Organizer"}
							</p>
							{user?.role === "volunteer" &&
								profile.skills &&
								profile.skills.length > 0 && (
									<div className="mt-4">
										<h3 className="text-sm font-semibold mb-2">
											Skills
										</h3>
										<div className="flex flex-wrap gap-1 justify-center">
											{profile.skills.map(
												(skill, index) => (
													<Badge
														key={index}
														variant="secondary"
													>
														{skill}
													</Badge>
												)
											)}
										</div>
									</div>
								)}
						</CardContent>
					</Card>

					<Card className="md:col-span-2">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle>Personal Information</CardTitle>
							{!isEditing && (
								<Button
									variant="outline"
									size="sm"
									onClick={() => setIsEditing(true)}
									disabled={loading}
								>
									<Edit className="h-4 w-4 mr-2" /> Edit
									Profile
								</Button>
							)}
						</CardHeader>
						<CardContent>
							{!isEditing ? (
								<div className="space-y-3">
									<div className="grid grid-cols-3 gap-4">
										<span className="font-bold">Name:</span>
										<span className="col-span-2">
											{profile.firstName}{" "}
											{profile.lastName}
										</span>
									</div>
									<div className="grid grid-cols-3 gap-4">
										<span className="font-bold">
											Email:
										</span>
										<span className="col-span-2">
											{profile.email}
										</span>
									</div>
									<div className="grid grid-cols-3 gap-4">
										<span className="font-bold">
											Phone:
										</span>
										<span className="col-span-2">
											{profile.phone || "Not provided"}
										</span>
									</div>
									<div className="grid grid-cols-3 gap-4">
										<span className="font-bold">
											Date of Birth:
										</span>
										<span className="col-span-2">
											{profile.dob
												? new Date(
														profile.dob
												  ).toLocaleDateString()
												: "Not provided"}
										</span>
									</div>
									<div className="grid grid-cols-3 gap-4">
										<span className="font-bold">
											Address:
										</span>
										<span className="col-span-2">
											{profile.address || "Not provided"}
										</span>
									</div>
									<div className="grid grid-cols-3 gap-4">
										<span className="font-bold">Bio:</span>
										<span className="col-span-2">
											{profile.bio || "No bio provided"}
										</span>
									</div>
								</div>
							) : (
								<form onSubmit={handleSubmit}>
									<div className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="avatar">
												Profile Picture
											</Label>
											<div className="flex flex-col space-y-2">
												{profile.avatar && (
													<div className="flex justify-center my-2">
														<Avatar className="w-20 h-20 border-2 border-primary">
															<AvatarImage
																src={
																	profile.avatarFile
																		? URL.createObjectURL(
																				profile.avatarFile
																		  )
																		: getAvatarUrl()
																}
																alt="Profile preview"
															/>
															<AvatarFallback>
																{profile.firstName?.charAt(
																	0
																) || ""}
																{profile.lastName?.charAt(
																	0
																) || ""}
															</AvatarFallback>
														</Avatar>
													</div>
												)}
												<div className="relative">
													<div className="flex items-center gap-2">
														<label
															htmlFor="avatar"
															className="border border-input bg-background rounded-md px-3 py-2 text-sm cursor-pointer inline-block min-w-24 text-center hover:bg-accent hover:text-accent-foreground transition-colors"
														>
															Choose file
														</label>
														<span className="text-sm text-gray-600">
															{profile.avatarFile
																? profile
																		.avatarFile
																		.name
																: "No file chosen"}
														</span>
														<Input
															id="avatar"
															type="file"
															accept="image/*"
															onChange={
																handleFileChange
															}
															className="hidden"
														/>
													</div>
													<p className="text-xs text-muted-foreground mt-1">
														Accepted formats: JPEG,
														PNG, WebP. Max size:
														5MB.
													</p>
												</div>
											</div>
										</div>
										<div className="space-y-2">
											<Label htmlFor="firstName">
												First Name
											</Label>
											<Input
												id="firstName"
												name="firstName"
												value={profile.firstName}
												onChange={handleChange}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="lastName">
												Last Name
											</Label>
											<Input
												id="lastName"
												name="lastName"
												value={profile.lastName}
												onChange={handleChange}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="email">Email</Label>
											<Input
												id="email"
												name="email"
												type="email"
												value={profile.email}
												onChange={handleChange}
												required
												disabled
											/>
											<p className="text-sm text-muted-foreground">
												Email cannot be changed
											</p>
										</div>
										<div className="space-y-2">
											<Label htmlFor="phone">
												Phone Number
											</Label>
											<Input
												id="phone"
												name="phone"
												value={profile.phone}
												onChange={handleChange}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="dob">
												Date of Birth
											</Label>
											<Input
												id="dob"
												name="dob"
												type="date"
												value={profile.dob}
												onChange={handleChange}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="address">
												Address
											</Label>
											<Input
												id="address"
												name="address"
												value={profile.address}
												onChange={handleChange}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="bio">Bio</Label>
											<Textarea
												id="bio"
												name="bio"
												value={profile.bio}
												onChange={handleChange}
												rows={4}
											/>
										</div>
										<div className="flex justify-end gap-2 mt-4">
											<Button
												type="button"
												variant="outline"
												onClick={() =>
													setIsEditing(false)
												}
												disabled={loading}
											>
												Cancel
											</Button>
											<Button
												type="submit"
												disabled={loading}
												className="border-2 border-black"
											>
												{loading ? (
													<>
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														Saving...
													</>
												) : (
													"Save Changes"
												)}
											</Button>
										</div>
									</div>
								</form>
							)}
						</CardContent>
					</Card>

					{/* NRIC Verification Card - Only show for volunteers */}
					{user?.role === "volunteer" && (
						<NricUploader
							profile={profile}
							onUploadSuccess={fetchUserProfile}
							setError={setError}
							setSuccess={setSuccess}
						/>
					)}

					<Card className="md:col-span-3">
						<CardHeader>
							<CardTitle>
								{user?.role === "volunteer"
									? "My Volunteer Activities"
									: "My Organized Events"}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{events.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Event</TableHead>
											<TableHead>Date</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{events.map((event) => (
											<TableRow key={event._id}>
												<TableCell className="font-medium">
													{event.name ||
														event.event?.name ||
														"Unnamed Event"}
												</TableCell>
												<TableCell>
													{event.start_date ||
													event.event?.start_date
														? new Date(
																event.start_date ||
																	event.event
																		?.start_date
														  ).toLocaleDateString()
														: "No date specified"}
												</TableCell>
												<TableCell>
													<Badge
														variant={
															(event.status ||
																event.event
																	?.status) ===
															"active"
																? "default"
																: "secondary"
														}
													>
														{(
															event.status ||
															event.event
																?.status ||
															"active"
														).toUpperCase()}
													</Badge>
												</TableCell>
												<TableCell>
													<div className="flex gap-2">
														<Button
															variant="outline"
															size="sm"
															className="h-8 w-8 p-0"
															asChild
														>
															<Link
																to={
																	user?.role ===
																	"organiser"
																		? `/organizer/events/${
																				event.id ||
																				event._id
																		  }`
																		: `/events/${
																				event.id ||
																				event.event_id ||
																				event
																					.event
																					?._id ||
																				event._id
																		  }`
																}
															>
																<Eye className="h-4 w-4" />
															</Link>
														</Button>
														{user?.role ===
															"organiser" && (
															<Button
																variant="outline"
																size="sm"
																className="h-8 w-8 p-0"
																asChild
															>
																<Link
																	to={`/events/edit/${
																		event.id ||
																		event._id
																	}`}
																>
																	<Edit className="h-4 w-4" />
																</Link>
															</Button>
														)}
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<div className="text-center py-6 text-muted-foreground">
									{user?.role === "volunteer"
										? "You haven't registered for any events yet."
										: "You haven't created any events yet."}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

export default Profile;
