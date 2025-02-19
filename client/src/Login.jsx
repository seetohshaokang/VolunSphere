import axios from "axios";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";

// Must need to connect to other jsx files
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LoginOrganiser from './LoginOrganiser';
import LoginVolunteer from "./LoginVolunteer";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/login/LoginOrganiser" element={<LoginOrganiser />} />
        <Route path="/login/LoginVolunteer" element={<LoginVolunteer />} />
      </Routes>
    </Router>
  );
}

function Login() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState(""); // Store success message
  const [error, setError] = useState(""); // Store error message
  const navigate = useNavigate();

  // Get the API URL from environment variables
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log(`URL is : ${apiUrl}`);

  // Function to fetch data from the backend
  const fetchData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/test-connection`);
      console.log("Full Response", response); // Log response from backend
      console.log(typeof response.data);

      if (response.data) {
        const { message, data } = await response.data;
        console.log(message);
        console.log(data);
        setMessage(message);
        setError("");
      } else {
        setError("No data returned from backend");
        setMessage("");
      }
    } catch (err) {
      console.error("Error fetching data from the backend:", err);
      setError("Failed to connect to the backend."); // Set error message
      setMessage(""); // Clear the success message
    }
  };

  // Call the fetchData function when the component mounts
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array means it runs once when the component mounts

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center split-background">
      <h1 className="fw-bold position-absolute top-0 start-50 translate-middle-x mt-4 display-4 split-title">
        <span className="text-white me-2">VOLUN</span>
        <span className="text-primary ms-2">SPHERE</span>
      </h1>

      <div className="row w-75 align-items-center">
        {/* Left Section */}
        <div className="col-md-6 text-white text-center d-flex flex-column justify-content-center align-items-center p-5">
          <h2 className="fw-bold me-2">I want to find volunteers</h2>
          <button onClick={() => navigate('/LoginOrganiser')} className="btn btn-outline-light fw-semibold px-4 py-2 border-2">
            SIGN UP AS ORGANISER
          </button>
        </div>

        {/* Image */}
        <div className="col-md-3 d-flex justify-content-left align-items-left curved-container">
          <img
            src="/src/assets/helping-hand.svg"
            alt="Helping Hand"
            className="img-fluid curved-image"
          />
        </div>

        {/* Right Section */}
        <div className="col-md-6 text-primary text-center d-flex flex-column justify-content-center align-items-center p-5">
          <h2 className="fw-bold mb-3">I want to help others</h2>
          <button onClick={() => navigate('/LoginVolunteer')} className="btn btn-primary fw-semibold px-4 py-2">
            SIGN UP AS VOLUNTEER
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
