// src/routes/AppRoutes.jsx
import { Routes } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AdminRoutes } from "./AdminRoutes";
import { OrganizerRoutes } from "./OrganizerRoutes";
import { PublicRoutes } from "./PublicRoutes";
import { VolunteerRoutes } from "./VolunteerRoutes";

const AppRoutes = () => {
	const { loading } = useAuth();

	if (loading) {
		return (
			<div className="h-screen flex justify-center items-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<Routes>
			{/* Public and Auth Routes */}
			{PublicRoutes}

			{/* Role-specific Routes */}
			{VolunteerRoutes}
			{OrganizerRoutes}
			{AdminRoutes}
		</Routes>
	);
};

export default AppRoutes;
