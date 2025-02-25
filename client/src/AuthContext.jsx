import { createContext, useContext, useState } from "react";

// Create AuthContext
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // `null` means no user is logged in

    // Function to log in (Example: Normally, you'd use Firebase, Supabase, or an API)
    const login = (userData) => {
        setUser(userData);
    };

    // Function to log out
    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);