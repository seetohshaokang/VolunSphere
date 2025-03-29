// src/components/MainLayout/index.jsx
import { Outlet, useLocation } from "react-router-dom";
import Footer from "../Footer";
import Navbar from "../Navbar";

const MainLayout = () => {
	const location = useLocation();
	// Defines a list of routes whereby the navbar should be hidden
	const hiddenNavbarRoutes = [
		"/login",
		"/LoginVolunteer",
		"/registrationorganiser",
		"/registrationvolunteer",
		"/registration",
		"/forgotPassword",
	];
	const showNavbarAndSidebar = !hiddenNavbarRoutes.includes(
		location.pathname
	);

	return (
		<div className="min-h-screen flex flex-col">
			{showNavbarAndSidebar ? (
				<>
					<Navbar />
					<main className="flex-1">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
							<Outlet />
						</div>
					</main>
					<Footer />
				</>
			) : (
				<main className="flex-1">
					<Outlet />
				</main>
			)}
		</div>
	);
};

export default MainLayout;
