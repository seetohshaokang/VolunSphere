// src/components/Navbar/index.jsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Navbar() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogin = () => {
		navigate("/login");
	};

	const handleSignup = () => {
		navigate("/registration");
	};

	return (
		// The support backdrop keeps the navbar at the top of the screen as u scroll and the content blurs out behind it
		<header className="sticky top-0 z-50 w-full border-b bg-[#c9ebff] backdrop-blur supports-[backdrop-filter]:bg-[#c9ebff]/60">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Added max-width constraint inside this div*/}
				<div className="flex h-16 items-center justify-between">
					{/* Container containing logo and text that is clickable */}
					<Link to="/" className="flex items-center gap-2">
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
												src={
													user.photoURL ||
													(user.role === "organiser"
														? "/src/assets/default-avatar-red.png"
														: "/src/assets/default-avatar-blue.png")
												}
												alt="Profile"
											/>
											<AvatarFallback>
												{user.name?.charAt(0) || "U"}
											</AvatarFallback>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>
										My Account
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link
											to="/profile"
											className="cursor-pointer flex items-center justify-between w-full"
										>
											Profile
											<Badge
												variant="secondary"
												className="ml-2"
											>
												New
											</Badge>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link
											to="/events/user/registered"
											className="cursor-pointer w-full"
										>
											My Events
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={logout}
										className="cursor-pointer"
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
