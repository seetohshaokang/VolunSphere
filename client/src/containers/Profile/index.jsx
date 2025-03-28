// src/containers/Profile/index.jsx
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
import { Edit, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import ContentHeader from "../../components/ContentHeader";
import { useAuth } from "../../contexts/AuthContext";

function Profile() {
	const { user } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [profile, setProfile] = useState({
		firstName: "John",
		lastName: "Lim",
		email: "john.lim@gmail.com",
		phone: "9123 4567",
		dob: "2000-01-01",
		bio: "I am always looking for ways to help out the community",
		avatar: "https://via.placeholder.com/150",
	});

	useEffect(() => {
		// Fetch user profile from API code remains the same
		if (user) {
			setProfile({
				...profile,
				email: user.email || profile.email,
				firstName: user.name
					? user.name.split(" ")[0]
					: profile.firstName,
				lastName: user.name
					? user.name.split(" ")[1] || ""
					: profile.lastName,
			});
		}
	}, [user]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setProfile({ ...profile, [name]: value });
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const imageUrl = URL.createObjectURL(file);
			setProfile({ ...profile, avatar: imageUrl });
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		setIsEditing(false);
		alert("Profile updated successfully!");
	};

	return (
		<>
			<ContentHeader
				title="My Profile"
				links={[
					{ to: "/", label: "Home" },
					{ label: "Profile", isActive: true },
				]}
			/>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card className="md:col-span-1">
					<CardContent className="p-6 flex flex-col items-center text-center">
						<Avatar className="w-24 h-24 border-4 border-primary">
							<AvatarImage
								src={profile.avatar}
								alt="User profile"
							/>
							<AvatarFallback>
								{profile.firstName.charAt(0)}
								{profile.lastName.charAt(0)}
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
							>
								<Edit className="h-4 w-4 mr-2" /> Edit Profile
							</Button>
						)}
					</CardHeader>
					<CardContent>
						{!isEditing ? (
							<div className="space-y-3">
								<div className="grid grid-cols-3 gap-4">
									<span className="font-bold">Name:</span>
									<span className="col-span-2">
										{profile.firstName} {profile.lastName}
									</span>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<span className="font-bold">Email:</span>
									<span className="col-span-2">
										{profile.email}
									</span>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<span className="font-bold">Phone:</span>
									<span className="col-span-2">
										{profile.phone}
									</span>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<span className="font-bold">
										Date of Birth:
									</span>
									<span className="col-span-2">
										{profile.dob}
									</span>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<span className="font-bold">Bio:</span>
									<span className="col-span-2">
										{profile.bio}
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
										<Input
											id="avatar"
											type="file"
											accept="image/*"
											onChange={handleFileChange}
										/>
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
										/>
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
											onClick={() => setIsEditing(false)}
										>
											Cancel
										</Button>
										<Button type="submit">
											Save Changes
										</Button>
									</div>
								</div>
							</form>
						)}
					</CardContent>
				</Card>

				<Card className="md:col-span-3">
					<CardHeader>
						<CardTitle>
							{user?.role === "volunteer"
								? "My Volunteer Activities"
								: "My Organized Events"}
						</CardTitle>
					</CardHeader>
					<CardContent>
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
								<TableRow>
									<TableCell className="font-medium">
										Beach Cleanup
									</TableCell>
									<TableCell>Apr 15, 2025</TableCell>
									<TableCell>
										<Badge>Active</Badge>
									</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												className="h-8 w-8 p-0"
											>
												<Eye className="h-4 w-4" />
											</Button>
											{user?.role !== "volunteer" && (
												<Button
													variant="outline"
													size="sm"
													className="h-8 w-8 p-0"
												>
													<Edit className="h-4 w-4" />
												</Button>
											)}
										</div>
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="font-medium">
										Food Bank Assistance
									</TableCell>
									<TableCell>Mar 20, 2025</TableCell>
									<TableCell>
										<Badge variant="secondary">
											Upcoming
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												className="h-8 w-8 p-0"
											>
												<Eye className="h-4 w-4" />
											</Button>
											{user?.role !== "volunteer" && (
												<Button
													variant="outline"
													size="sm"
													className="h-8 w-8 p-0"
												>
													<Edit className="h-4 w-4" />
												</Button>
											)}
										</div>
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</>
	);
}

export default Profile;
