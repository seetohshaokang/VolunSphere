import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

const MainLayout = () => {
	const location = useLocation();
	const hiddenNavbarRoutes = [
		"/login",
		"/LoginVolunteer",
		"/RegistrationOrganiser",
	];
	const showNavbar = !hiddenNavbarRoutes.includes(location.pathname);

	return (
		<>
			{showNavbar && <Navbar />}
			<main>
				<Outlet />
			</main>
		</>
	);
};

export default MainLayout;
