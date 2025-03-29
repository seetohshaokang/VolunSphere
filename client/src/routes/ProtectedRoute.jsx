// src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, roleRequired }) => {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="h-screen flex justify-center items-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" />;
	}

	// If a specific role is required and user doesn't have it
	if (roleRequired && user.role !== roleRequired) {
		// Redirect volunteers to home, organizers to their dashboard
		if (user.role === "organiser") {
			return <Navigate to="/organizer" />;
		} else {
			return <Navigate to="/" />;
		}
	}

	return children;
};

export default ProtectedRoute;
