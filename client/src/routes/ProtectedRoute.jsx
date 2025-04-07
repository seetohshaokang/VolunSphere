// src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, roleRequired }) => {
    const { user, loading } = useAuth();

    // Show loading spinner while authentication state is being determined
    if (loading) {
        return (
            <div className="h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" />;
    }

    // If a specific role is required and user doesn't have it
    if (roleRequired && user.role !== roleRequired) {
        // Redirect based on user's actual role
        return <Navigate to={user.role === "admin" ? "/admin" : 
                           user.role === "organiser" ? "/organizer" : "/"} />;
    }

    // User has the required role (or no specific role was required)
    return children;
};

export default ProtectedRoute;