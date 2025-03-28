import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Sidebar() {
	const { user } = useAuth();
	const isOrganizer = user?.role === "organiser";

	return (
		<ul className="menu p-4 w-64 h-full bg-base-200 text-base-content">
			<li className="mb-4">
				<Link to="/" className="flex items-center py-2">
					<i className="fas fa-home mr-2"></i>
					<span>Home</span>
				</Link>
			</li>

			<li className="menu-title">
				<span>Events</span>
			</li>
			<li>
				<Link to="/events" className="flex items-center py-2">
					<i className="fas fa-calendar-alt mr-2"></i>
					<span>Browse Events</span>
				</Link>
			</li>

			{user && (
				<>
					<li>
						<Link
							to="/events/user/registered"
							className="flex items-center py-2"
						>
							<i className="fas fa-clipboard-list mr-2"></i>
							<span>My Registrations</span>
						</Link>
					</li>

					{isOrganizer && (
						<>
							<li className="menu-title">
								<span>Organize</span>
							</li>
							<li>
								<Link
									to="/events/user/organized"
									className="flex items-center py-2"
								>
									<i className="fas fa-tasks mr-2"></i>
									<span>Manage Events</span>
								</Link>
							</li>
							<li>
								<Link
									to="/events/create"
									className="flex items-center py-2"
								>
									<i className="fas fa-plus-circle mr-2"></i>
									<span>Create Event</span>
								</Link>
							</li>
						</>
					)}
				</>
			)}

			<li className="menu-title">
				<span>Account</span>
			</li>
			{user ? (
				<>
					<li>
						<Link to="/profile" className="flex items-center py-2">
							<i className="fas fa-user mr-2"></i>
							<span>Profile</span>
						</Link>
					</li>
				</>
			) : (
				<>
					<li>
						<Link to="/login" className="flex items-center py-2">
							<i className="fas fa-sign-in-alt mr-2"></i>
							<span>Login</span>
						</Link>
					</li>
					<li>
						<Link
							to="/registration"
							className="flex items-center py-2"
						>
							<i className="fas fa-user-plus mr-2"></i>
							<span>Register</span>
						</Link>
					</li>
				</>
			)}
		</ul>
	);
}

export default Sidebar;
