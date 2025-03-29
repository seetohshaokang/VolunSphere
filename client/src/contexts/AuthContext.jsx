import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "../helpers/authService";

// Create AuthContext
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null); // `null` means no user is logged in
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Check if user is already logged in from localStorage
		const storedUser = getCurrentUser();
		const token = localStorage.getItem("token");

		if (storedUser && token) {
			setUser(storedUser);
		} else {
			localStorage.removeItem("user");
			localStorage.removeItem("token");
		}
		setLoading(false);
	}, []);

	// Function to log in
	const login = (userData) => {
		setUser(userData);
		localStorage.setItem("user", JSON.stringify(userData));
	};

	// Function to log out
	const logout = async () => {
		try {
			await logoutUser();
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			setUser(null);
			localStorage.removeItem("user");
			localStorage.removeItem("token");
		}
	};

	return (
		<AuthContext.Provider value={{ user, login, logout, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);
