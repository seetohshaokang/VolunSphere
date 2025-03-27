import { Route, Routes } from "react-router-dom";
import MainLayout from "../components/MainLayout";
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
		return <div>Loading...</div>;
	}

	return (
		<Routes>
			<Route element={<MainLayout />}>
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
			</Route>
		</Routes>
	);
};

export default AppRoutes;
