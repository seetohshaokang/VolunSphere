import { Link, useLocation } from "react-router-dom";

const AdminSidebar = () => {
	const location = useLocation();

	const navItems = [
		{
			path: "/admin/users",
			label: "Users",
			icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
		},
		{
			path: "/admin/events",
			label: "Events",
			icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
		},
		{
			path: "/admin/reports",
			label: "Reports",
			icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
		},
		{
			path: "/admin/verifications",
			label: "Verifications",
			icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
		},
	];

	const isActive = (path) => location.pathname.startsWith(path);

	return (
		<div className="bg-gray-100 rounded-lg shadow-sm h-auto">
			<div className="p-4 border-b border-gray-200">
				<h2 className="text-lg font-semibold">Menu</h2>
			</div>
			<nav className="p-2">
				<ul>
					{navItems.map((item) => (
						<li key={item.path} className="mb-1">
							<Link
								to={item.path}
								className={`flex items-center px-3 py-2 rounded-md hover:bg-white ${
									isActive(item.path)
										? "bg-white shadow-sm"
										: ""
								}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 mr-2 text-gray-600"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d={item.icon}
									/>
								</svg>
								<span className="text-gray-700 text-sm">
									{item.label}
								</span>
							</Link>
						</li>
					))}
				</ul>
			</nav>
		</div>
	);
};

export default AdminSidebar;
