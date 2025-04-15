// src/routes/PublicRoutes.jsx
import MainLayout from "@/components/MainLayout";
import ResetPassword from "@/containers/Auth/ResetPassword";
import { Route } from "react-router-dom";
import ForgotPassword from "../containers/Auth/ForgotPassword";
import Login from "../containers/Auth/Login";
import Registration from "../containers/Auth/Registration";
import RegistrationOrganiser from "../containers/Auth/RegistrationOrganiser";
import RegistrationVolunteer from "../containers/Auth/RegistrationVolunteer";
import Home from "../containers/Common/Home";
import VolunteerEventDetail from "../containers/Volunteer/EventDetail";

export const PublicRoutes = (
	<>
		{/* Auth Routes */}
		<Route path="/login" element={<Login />} />
		<Route path="/registration" element={<Registration />} />
		<Route
			path="/registrationorganiser"
			element={<RegistrationOrganiser />}
		/>
		<Route
			path="/registrationvolunteer"
			element={<RegistrationVolunteer />}
		/>
		<Route path="/forgot-password" element={<ForgotPassword />} />
		<Route path="/reset-password/:token" element={<ResetPassword />} />

		{/* Public Routes in MainLayout */}
		<Route element={<MainLayout />}>
			<Route path="/" element={<Home />} />
			<Route path="/events/:eventId" element={<VolunteerEventDetail />} />
		</Route>
	</>
);
