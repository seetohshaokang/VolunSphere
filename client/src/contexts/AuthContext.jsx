import { createContext, useContext, useEffect, useState } from "react";

// Create AuthContext
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null); // `null` means no user is logged in
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		const token = localStorage.getItem("token");

		if (storedUser && token) {
			setUser(JSON.parse(storedUser));
		}
		setLoading(false);
	});

	// Function to log in (Example: Normally, you'd use Firebase, Supabase, or an API)
	const login = (userData) => {
		setUser(userData);
		localStorage.setItem("user", JSON.stringify(userData));
	};

	// Function to log out
	const logout = () => {
		setUser(null);
		localStorage.removeItem("user");
		localStorage.removeItem("token");
	};

	return (
		<AuthContext.Provider value={{ user, login, logout, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);
