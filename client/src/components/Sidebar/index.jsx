// src/components/Sidebar/index.jsx
import { Button } from "@/components/ui/button";
import {
	Calendar,
	ClipboardList,
	Home,
	LogIn,
	Plus,
	Tasks,
	User,
	UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Sidebar() {
	const { user } = useAuth();
	const isOrganizer = user?.role === "organiser";

	return (
		<div className="pb-12 h-full border-r">
			<div className="space-y-4 py-4">
				<div className="px-4 py-2">
					<Link to="/">
						<Button
							variant="ghost"
							className="w-full justify-start"
						>
							<Home className="mr-2 h-4 w-4" />
							Home
						</Button>
					</Link>
				</div>

				<div className="px-4">
					<h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
						Events
					</h2>
					<div className="space-y-1">
						<Link to="/events">
							<Button
								variant="ghost"
								className="w-full justify-start"
							>
								<Calendar className="mr-2 h-4 w-4" />
								Browse Events
							</Button>
						</Link>

						{user && (
							<Link to="/events/user/registered">
								<Button
									variant="ghost"
									className="w-full justify-start"
								>
									<ClipboardList className="mr-2 h-4 w-4" />
									My Registrations
								</Button>
							</Link>
						)}

						{isOrganizer && (
							<>
								<h2 className="mt-4 mb-2 px-2 text-lg font-semibold tracking-tight">
									Organize
								</h2>
								<Link to="/events/user/organized">
									<Button
										variant="ghost"
										className="w-full justify-start"
									>
										<Tasks className="mr-2 h-4 w-4" />
										Manage Events
									</Button>
								</Link>
								<Link to="/events/create">
									<Button
										variant="ghost"
										className="w-full justify-start"
									>
										<Plus className="mr-2 h-4 w-4" />
										Create Event
									</Button>
								</Link>
							</>
						)}
					</div>
				</div>

				<div className="px-4">
					<h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
						Account
					</h2>
					<div className="space-y-1">
						{user ? (
							<Link to="/profile">
								<Button
									variant="ghost"
									className="w-full justify-start"
								>
									<User className="mr-2 h-4 w-4" />
									Profile
								</Button>
							</Link>
						) : (
							<>
								<Link to="/login">
									<Button
										variant="ghost"
										className="w-full justify-start"
									>
										<LogIn className="mr-2 h-4 w-4" />
										Login
									</Button>
								</Link>
								<Link to="/registration">
									<Button
										variant="ghost"
										className="w-full justify-start"
									>
										<UserPlus className="mr-2 h-4 w-4" />
										Register
									</Button>
								</Link>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Sidebar;
