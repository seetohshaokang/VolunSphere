import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "../helpers/authService";
import Api from "../helpers/Api";

// Create AuthContext
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null); // `null` means no user is logged in
	const [loading, setLoading] = useState(true);
	const [profileData, setProfileData] = useState(null);
	const [profileLoading, setProfileLoading] = useState(false);
	const [profileTimestamp, setProfileTimestamp] = useState(Date.now());

	useEffect(() => {
		// Check if user is already logged in from localStorage
		const storedUser = getCurrentUser();
		const token = localStorage.getItem("token");

		if (storedUser && token) {
			setUser(storedUser);
			// Fetch profile data
			fetchUserProfile(storedUser);
		} else {
			localStorage.removeItem("user");
			localStorage.removeItem("token");
		}
		setLoading(false);
	}, []);

	// Function to fetch user profile
	const fetchUserProfile = async (currentUser) => {
		if (!currentUser) return;
		
		setProfileLoading(true);
		try {
			const response = await Api.getUserProfile({
				headers: {
					"Cache-Control": "no-cache",
					Pragma: "no-cache",
				},
			});

			if (response.ok) {
				const data = await response.json();
				console.log("Profile data fetched in AuthContext:", data);
				setProfileData(data.profile);
				
				// Update the stored user with profile picture
				const updatedUser = {
					...currentUser,
					profilePicture: data.profile.profile_picture_url
				};
				setUser(updatedUser);
				localStorage.setItem("user", JSON.stringify(updatedUser));
			}
		} catch (err) {
			console.error("Error fetching profile in AuthContext:", err);
		} finally {
			setProfileLoading(false);
		}
	};

	// Function to refresh profile data
	const refreshProfile = () => {
		setProfileTimestamp(Date.now());
		return fetchUserProfile(user);
	};

	// Function to log in
	const login = (userData) => {
		setUser(userData);
		localStorage.setItem("user", JSON.stringify(userData));
		// Fetch profile after login
		fetchUserProfile(userData);
	};

	// Function to log out
	const logout = async () => {
		try {
			await logoutUser();
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			setUser(null);
			setProfileData(null);
			localStorage.removeItem("user");
			localStorage.removeItem("token");
		}
	};

	return (
		<AuthContext.Provider value={{ 
			user, 
			login, 
			logout, 
			loading,
			profileData,
			profileLoading,
			profileTimestamp,
			refreshProfile
		}}>
			{children}
		</AuthContext.Provider>
	);
};

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);
