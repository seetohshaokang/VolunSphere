import axios from 'axios'; // Import Axios
import { useEffect, useState } from 'react';
import './App.css';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

// Must need to connect to other jsx files
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './login';
import RegistrationOrganiser from './RegistrationOrganiser';
import LoginVolunteer from './LoginVolunteer';
import EditProfile from './profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/RegistrationOrganiser" element={<RegistrationOrganiser />} />
        <Route path="/LoginVolunteer" element={<LoginVolunteer />} />
        <Route path="/Profile" element={<EditProfile />} />
      </Routes>
    </Router>
  );
}

function Home() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState(''); // Store success message
  const [error, setError] = useState(''); // Store error message
  const navigate = useNavigate();

  // Get the API URL from environment variables
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log(`URL is : ${apiUrl}`);

  // Function to fetch data from the backend
  const fetchData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/test-connection`);
      console.log('Full Response', response); // Log response from backend
      console.log(typeof response.data);

      if (response.data) {
        const {message, data} = await response.data;
        console.log(message);
        console.log(data);
        setMessage(message);
        setError('');
      } else {
        setError('No data returned from backend');
        setMessage('');
      }
    } catch (err) {
      console.error('Error fetching data from the backend:', err);
      setError('Failed to connect to the backend.'); // Set error message
      setMessage(''); // Clear the success message
    }
  };

  // Call the fetchData function when the component mounts
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array means it runs once when the component mounts

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => navigate('/login')} className="btn btn-primary mt-3">
          Go to Login Page
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>

      {/* Show the fetched message or error */}
      <div className="message-container">
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;