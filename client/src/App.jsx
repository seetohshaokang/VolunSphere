// Must need to connect to other jsx files
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider
import Home from './pages/Home';
import Navbar from './layout/Navbar';
import Registration from './pages/auth/Registration';
import Login from './pages/auth/Login';
import RegistrationOrganiser from './pages/auth/RegistrationOrganiser';
import RegistrationVolunteer from './pages/auth/RegistrationVolunteer';
import ForgotPassword from './pages/auth/ForgotPassword';
import EditProfile from './pages/profile';
import EventDetail from './pages/EventDetail';

function App() {
	return (
		<AuthProvider>
			<Router>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/Registration" element={<Registration />} />
					<Route path="/Login" element={<Login />} />
					<Route path="/RegistrationOrganiser" element={<RegistrationOrganiser />} />
					<Route path="/RegistrationVolunteer" element={<RegistrationVolunteer />} />
					<Route path="/ForgotPassword" element={<ForgotPassword />} />
					<Route path="/Profile" element={<EditProfile />} />
					<Route path="/event/:eventId" element={<EventDetail />} />
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;
