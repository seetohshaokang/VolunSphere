// client/src/containers/Admin/Profile/index.jsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ContentHeader from "../../../components/ContentHeader";
import { useAuth } from "../../../contexts/AuthContext";
import Api from "../../../helpers/Api";

function AdminProfile() {
	const { user, refreshProfile } = useAuth();
	const navigate = useNavigate();
	const [isEditing, setIsEditing] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);
	const [profile, setProfile] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		avatar: null,
		avatarFile: null,
	});
	const [imageTimestamp, setImageTimestamp] = useState(Date.now());

	useEffect(() => {
		// Redirect if not an admin
		if (user && user.role !== "admin") {
			navigate("/");
			return;
		}

		fetchUserProfile();
	}, [user, navigate]);

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

			// Create a default profile data structure
			const profileData = {
				firstName: "",
				lastName: "",
				email: data.user.email || "Email not provided",
				phone: data.profile.phone || "",
				avatar: data.profile.profile_picture_url,
			};

			// Parse the name
			let fullName = data.profile.name || "";
			if (fullName.includes(" ")) {
				const nameParts = fullName.split(" ");
				profileData.firstName = nameParts[0];
				profileData.lastName = nameParts.slice(1).join(" ");
			} else {
				profileData.firstName = fullName;
			}

			setProfile(profileData);
		} catch (err) {
			console.error("Error fetching profile:", err);
			setError("Failed to load profile data. Please try again.");
		} finally {
			setLoading(false);
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

			if (profile.avatarFile) {
				formData.append("profile_picture", profile.avatarFile);
			}

			const data = await Api.updateUserProfile(formData);

			if (!data || !data.profile) {
				throw new Error("Failed to update profile");
			}

			toast.success("Profile updated successfully!");

			setImageTimestamp(Date.now());
			setSuccess("Profile updated successfully!");
			setIsEditing(false);

			// Update the profile data in the auth context
			if (typeof refreshProfile === "function") {
				refreshProfile();
			}

			fetchUserProfile();
		} catch (err) {
			toast.error("Failed to update proifle. Please try again.");
			setError("Failed to update profile. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Function to handle avatar URL with potential cache busting
	const getAvatarUrl = () => {
		if (!profile.avatar) {
			return "/src/assets/default-avatar-purple.png";
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

	return (
		<div className="min-h-screen">
			{/* Main content container with width constraints matching main page */}
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
				<ContentHeader title="Admin Profile" />

				{/* {error && (
					<Alert variant="destructive" className="mb-6">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{success && (
					<Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
						<AlertDescription>{success}</AlertDescription>
					</Alert>
				)} */}

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Card className="md:col-span-1">
						<CardContent className="p-6 flex flex-col items-center text-center">
							<Avatar className="w-24 h-24 border-4 border-primary">
								<AvatarImage
									src={getAvatarUrl()}
									alt="Admin profile"
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
								Administrator
							</p>
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
										<span className="font-bold">Role:</span>
										<span className="col-span-2">
											System Administrator
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
												variant="outline"
												disabled={loading}
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

					{/* Additional admin-specific card */}
					<Card className="md:col-span-3">
						<CardHeader>
							<CardTitle>Admin Information</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									<div className="bg-primary/10 p-4 rounded-lg">
										<h3 className="font-semibold text-primary mb-2">
											Account Status
										</h3>
										<p>Active Administrator</p>
									</div>

									<div className="bg-primary/10 p-4 rounded-lg">
										<h3 className="font-semibold text-primary mb-2">
											Last Login
										</h3>
										<p>{new Date().toLocaleString()}</p>
									</div>

									<div className="bg-primary/10 p-4 rounded-lg">
										<h3 className="font-semibold text-primary mb-2">
											Account Security
										</h3>
										<p>
											Two-factor authentication: Disabled
										</p>
									</div>
								</div>

								<div className="flex justify-end mt-4">
									<Button variant="outline" className="mr-2">
										Security Settings
									</Button>
									<Button variant="outline">
										Admin Dashboard
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

export default AdminProfile;
