import { Route, Routes } from "react-router-dom";
import ForgotPassword from "../containers/Auth/ForgotPassword";
import Login from "../containers/Auth/Login";
import Registration from "../containers/Auth/Registration";
import RegistrationOrganiser from "../containers/Auth/RegistrationOrganiser";
import RegistrationVolunteer from "../containers/Auth/RegistrationVolunteer";
import Home from "../containers/Home";
import ListEvents from "../containers/ListEvents";
import ManageEvent from "../containers/ManageEvent";
import Profile from "../containers/Profile";
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

			<Route path="/" element={<Home />} />

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
			<Route path="/events" element={<ListEvents />} />

			{/* Protected Routes */}
			<Route
				path="/profile"
				element={
					<ProtectedRoute>
						<Profile />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/events/create"
				element={
					<ProtectedRoute>
						<ManageEvent />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/events/edit/:id"
				element={
					<ProtectedRoute>
						<ManageEvent />
					</ProtectedRoute>
				}
			/>
		</Routes>
	);
};

export default AppRoutes;
