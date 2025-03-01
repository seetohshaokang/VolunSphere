import axios from 'axios'; // Import Axios
import { useEffect, useState } from 'react';
import './App.css';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

// Must need to connect to other jsx files
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext'; // Import AuthProvider
import Home from './Home';
import Navbar from './Navbar';
import Registration from './Registration';
import Login from './Login';
import RegistrationOrganiser from './RegistrationOrganiser';
import RegistrationVolunteer from './RegistrationVolunteer';
import EditProfile from './profile';

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
					<Route path="/Profile" element={<EditProfile />} />
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;