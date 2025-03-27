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
		<div className="wrapper">
			{showNavbarAndSidebar && <Navbar />}
			{showNavbarAndSidebar && <Sidebar />}
			<div className={`${showNavbarAndSidebar ? "content-wrapper" : ""}`}>
				<Outlet />
			</div>
			{showNavbarAndSidebar && <Footer />}
		</div>
	);
};

export default MainLayout;
