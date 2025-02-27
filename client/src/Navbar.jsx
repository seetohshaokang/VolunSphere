// In Navbar.jsx
import { useAuth } from "./AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react"; // Import these

function Navbar() {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // For testing purposes - remove in production
    const [testLoggedIn, setTestLoggedIn] = useState(false);
    // Toggle test login status with keyboard shortcut (Ctrl+Shift+L)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                setTestLoggedIn(!testLoggedIn);
                if (!testLoggedIn) {
                    // Set dummy user data for testing
                    login({ name: 'Test User', email: 'test@example.com' });
                } else {
                    logout();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [testLoggedIn, login, logout]);

    const hiddenRoutes = ['/login', '/LoginVolunteer', '/RegistrationOrganiser'];

    if (hiddenRoutes.includes(location.pathname)) {
        return null;
    }

    // state for navbar collapse
    const [isNavCollapsed, setIsNavCollapsed] = useState(true);
    const handleNavCollapse = () => {
        setIsNavCollapsed(!isNavCollapsed);
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const handleSignup = () => {
        navigate("/registration");
    };

    const handleProfileClick = () => {
        navigate('/profile');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light fixed-top" style={{ backgroundColor: "#e3f2fd" }}>
            <div className="container">
                <Link className="navbar-brand" to="/">VolunSphere</Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={handleNavCollapse}
                    aria-expanded={!isNavCollapsed ? true : false}
                    aria-label="Toggle navigation"
                >                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="navbarSupportedContent">
                    <ul className="navbar-nav ms-auto">
                        {user || testLoggedIn ? (
                            // Show profile icon for logged in users
                            <li className="nav-item">
                                <button
                                    onClick={handleProfileClick}
                                    className="btn btn-link nav-link"
                                    style={{ padding: '6px' }}
                                >
                                    <img
                                        src="/src/assets/profile-icon.svg"
                                        alt="Profile"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                        }}
                                    />
                                </button>
                            </li>
                        ) : (
                            // Show login/signup for non-logged in users
                            <>
                                <li className="nav-item me-2 mb-2">
                                    <button className="btn btn-outline-primary" onClick={handleLogin}>Log In</button>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-outline-secondary" onClick={handleSignup}>Sign Up</button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;