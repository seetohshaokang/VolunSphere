// src/components/MainLayout/index.jsx
import { Outlet, useLocation } from "react-router-dom";
import Footer from "../Footer";
import Navbar from "../Navbar";
// Remove the Sidebar import

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
		<div className="min-h-screen flex flex-col">
			{showNavbarAndSidebar && (
				<>
					<Navbar />
					<div className="flex-1 p-4 lg:p-6">
						<Outlet />
					</div>
					<Footer />
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
