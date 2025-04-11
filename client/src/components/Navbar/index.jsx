// src/components/Navbar/index.jsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getProfileImageUrl } from "../../helpers/profileHelper";

function Navbar() {
	const { user, logout, profileData, profileTimestamp } = useAuth();
	const navigate = useNavigate();
	const [name, setName] = useState({ firstName: "", lastName: "" });

	useEffect(() => {
		if (profileData?.name) {
			// Parse name (assuming it comes as full name)
			let firstName = profileData.name || "";
			let lastName = "";

			if (firstName.includes(" ")) {
				const nameParts = firstName.split(" ");
				firstName = nameParts[0];
				lastName = nameParts.slice(1).join(" ");
			}

			setName({ firstName, lastName });
		}
	}, [profileData]);

	const handleLogin = () => {
		navigate("/login");
	};

	const handleSignup = () => {
		navigate("/registration");
	};

	// Get avatar URL from profile data
	const getAvatarUrl = () => {
		return getProfileImageUrl(
			user,
			user?.profilePicture || profileData?.profile_picture_url,
			profileTimestamp
		);
	};

	const handleHomeClick = (e) => {
		e.preventDefaut();
		if (user) {
			switch (user.role) {
				case "admin":
					navigate("/admin");
					break;
				case "organiser":
					navigate("/organizer");
					break;
				case "volunteer":
				default:
					navigate("/");
					break;
			}
		} else {
			navigate("/");
		}
	};

	return (
		// The support backdrop keeps the navbar at the top of the screen as u scroll and the content blurs out behind it
		<header className="sticky top-0 z-50 w-full border-b bg-[#c9ebff] backdrop-blur supports-[backdrop-filter]:bg-[#c9ebff]/60">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Added max-width constraint inside this div*/}
				<div className="flex h-16 items-center justify-between">
					{/* Container containing logo and text that is clickable */}
					<Link
						onClick={handleHomeClick}
						className="flex items-center gap-2"
					>
						{/* Logo with white border behind */}
						<div className="w-10 h-10 rounded-full overflow-hidden bg-white p-0.3 shadow-sm">
							<img
								src="/src/assets/volunsphere.png"
								alt="VolunSphere Logo"
								className="w-full h-full object-cover"
							/>
						</div>
						{/* Text */}
						<span className="hidden sm:inline-block font-bold text-xl">
							VolunSphere
						</span>
					</Link>

					<div className="flex items-center">
						{user ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="relative h-10 w-10 rounded-full"
									>
										<Avatar>
											<AvatarImage
												src={getAvatarUrl()}
												alt="Profile"
											/>
											<AvatarFallback>
												{name.firstName?.charAt(0) ||
													""}
												{name.lastName?.charAt(0) || ""}
											</AvatarFallback>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="bg-white shadow-md border rounded-md p-2 w-48"
								>
									<DropdownMenuLabel className="text-gray-700 font-semibold px-3 py-2">
										My Account
									</DropdownMenuLabel>
									<DropdownMenuSeparator className="bg-gray-200" />
									<DropdownMenuItem asChild>
										<Link
											to="/profile"
											className="cursor-pointer flex items-center w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
										>
											Profile
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link
											to="/events/user/registered"
											className="cursor-pointer w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
										>
											My Events
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator className="bg-gray-200" />
									<DropdownMenuItem
										onClick={logout}
										className="cursor-pointer px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
									>
										Logout
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							// Display log in and sign up button when not authenticated
							<div className="flex gap-2">
								<Button variant="outline" onClick={handleLogin}>
									Log In
								</Button>
								<Button onClick={handleSignup}>Sign Up</Button>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}

export default Navbar;
