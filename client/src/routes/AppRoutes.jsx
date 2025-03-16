import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import MainLayout from "../layout/MainLayout";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Login from "../pages/auth/Login";
import Registration from "../pages/auth/Registration";
import RegistrationOrganiser from "../pages/auth/RegistrationOrganiser";
import RegistrationVolunteer from "../pages/auth/RegistrationVolunteer";
import Home from "../pages/Home";
import Profile from "../pages/Profile";

// Protected route component
const ProtectedRoute = ({ children }) => {
	const { user } = useAuth();

	if (!user) {
		return <Navigate to="/login" />;
	}
	return children;
};

const AppRoutes = () => {
	return (
		<Routes>
			<Route element={<MainLayout />}>
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
				<Route
					path="/profile"
					element={
						<ProtectedRoute>
							<Profile />
						</ProtectedRoute>
					}
				/>
			</Route>
		</Routes>
	);
};

export default AppRoutes;
