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
					<main className="flex-1 container mx-auto py-6 px-4">
						<Outlet />
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
