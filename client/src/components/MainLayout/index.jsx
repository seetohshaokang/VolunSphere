import { Outlet, useLocation } from "react-router-dom";
import Footer from "../Footer";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";

const MainLayout = () => {
	const location = useLocation();
	const hiddenNavbarRoutes = [
		"/login",
		"/LoginVolunteer",
		"/RegistrationOrganiser",
		"/RegistrationVolunteer",
		"/registration",
		"/forgotPassword",
	];
	const showNavbarAndSidebar = !hiddenNavbarRoutes.includes(
		location.pathname
	);

	return (
		<div className="drawer lg:drawer-open" data-theme="volunsphere">
			{showNavbarAndSidebar && (
				<>
					<input
						id="drawer-toggle"
						type="checkbox"
						className="drawer-toggle"
					/>
					<div className="drawer-content flex flex-col">
						<Navbar />
						<div className="flex-1 p-4 lg:p-6">
							<Outlet />
						</div>
						<Footer />
					</div>
					<div className="drawer-side">
						<label
							htmlFor="drawer-toggle"
							className="drawer-overlay"
						></label>
						<Sidebar />
					</div>
				</>
			)}

			{!showNavbarAndSidebar && (
				<div className="flex flex-col min-h-screen">
					<Outlet />
				</div>
			)}
		</div>
	);
};

export default MainLayout;
