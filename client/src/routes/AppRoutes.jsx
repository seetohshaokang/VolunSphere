// src/routes/AppRoutes.jsx
import MainLayout from "@/components/MainLayout";
import { Route, Routes } from "react-router-dom";

// Auth
import ForgotPassword from "../containers/Auth/ForgotPassword";
import Login from "../containers/Auth/Login";
import Registration from "../containers/Auth/Registration";
import RegistrationOrganiser from "../containers/Auth/RegistrationOrganiser";
import RegistrationVolunteer from "../containers/Auth/RegistrationVolunteer";

// Common
import Home from "../containers/Common/Home";
// import NotFound from "../containers/Common/NotFound";
import Profile from "../containers/Common/Profile";

// Volunteer
import VolunteerEventDetail from "../containers/Volunteer/EventDetail";
// import VolunteerMyEvents from "../containers/Volunteer/MyEvents";

// Organizer
// import OrganizerCreateEvent from "../containers/Organizer/CreateEvent";
import OrganizerDashboard from "../containers/Organizer/Dashboard";
import OrganizerEventDetail from "../containers/Organizer/EventDetail";
import OrganizerManageEvent from "../containers/Organizer/ManageEvent";
import OrganizerProfile from "../containers/Volunteer/OrganizerProfile";

// Review Page
import ReviewPage from "../containers/Volunteer/Review";


import { useAuth } from "../contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
	const { loading } = useAuth();

	if (loading) {
		return (
			<div className="h-screen flex justify-center items-center">
				<div className="loading loading-spinner loading-lg text-primary"></div>
			</div>
		);
	}

	return (
		<Routes>
			{/* Public Routes */}
			<Route element={<MainLayout />}>
				<Route path="/" element={<Home />} />

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
				<Route path="/forgotpassword" element={<ForgotPassword />} />

				{/* Events (Public View) */}
				<Route
					path="/events/:eventId"
					element={<VolunteerEventDetail />}
				/>

				{/* Event creation and edit routes */}
				<Route
					path="/events/create"
					element={
						<ProtectedRoute roleRequired="organiser">
							<OrganizerManageEvent />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/events/edit/:id"
					element={
						<ProtectedRoute roleRequired="organiser">
							<OrganizerManageEvent />
						</ProtectedRoute>
					}
				/>
			</Route>

			{/* Protected Routes */}
			<Route
				path="/profile"
				element={
					<ProtectedRoute>
						<Profile />
					</ProtectedRoute>
				}
			/>

			{/* Volunteer Routes */}
			<Route
				path="/volunteer"
				element={
					<ProtectedRoute>
						<MainLayout />
					</ProtectedRoute>
				}
			></Route>

			<Route 
				path="/organisers/:id" 
				element={
				<OrganizerProfile />} 
			/>

			{/* Organizer Routes */}
			<Route
				path="/organizer"
				element={
					<ProtectedRoute roleRequired="organiser">
						<MainLayout />
					</ProtectedRoute>
				}
			>
				<Route index element={<OrganizerDashboard />} />
				<Route
					path="events/:eventId"
					element={<OrganizerEventDetail />}
				/>
			</Route>

			{/* Review Routes */}
			<Route path="/events/:id/review" element={<ReviewPage />} />
			<Route path="/organisers/:id/review" element={<ReviewPage />} />
		</Routes>
	);
};

export default AppRoutes;
