import axios from "axios";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./Login.module.css"; // Import CSS module
import { useNavigate } from "react-router-dom";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
      </Routes>
    </Router>
  );
}

function Login() {
  const [message, setMessage] = useState(""); // Store success message
  const [error, setError] = useState(""); // Store error message
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [validated, setValidated] = useState(false);

  // Get the API URL from environment variables
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log(`URL is: ${apiUrl}`);

  // Function to fetch data from the backend
  const fetchData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/test-connection`);
      console.log("Full Response", response); // Log response from backend

      if (response.data) {
        setMessage(response.data.message);
        setError("");
      } else {
        setError("No data returned from backend");
        setMessage("");
      }
    } catch (err) {
      console.error("Error fetching data from the backend:", err);
      setError("Failed to connect to the backend.");
      setMessage("");
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      console.log("Form submitted successfully!");
    }

    setValidated(true);
  };

  return (
    <div className={`d-flex justify-content-center align-items-center ${styles.container}`}>
      <div className={`card p-5 ${styles.card}`}>
        <h2 className="text-center fw-bold">VolunSphere</h2>
        <h3 className="text-center fw-semibold mb-3">Log in</h3>
        <p className="text-center text-muted mb-4">
          Continue your search for volunteer opportunities
        </p>

        <form noValidate className={`needs-validation ${validated ? "was-validated" : ""}`} onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label fw-semibold">Email address</label>
            <input type="email" className="form-control form-control-lg" placeholder="Enter your email" required />
            <div className="invalid-feedback">Please enter a valid email.</div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>
            <input type="password" className="form-control form-control-lg" placeholder="Enter your password" required />
            <div className="invalid-feedback">Password is required.</div>
          </div>

          <button type="submit" className="btn btn-dark w-100 py-3">
            Log in
          </button>

          <div className="text-center mt-3">
            <a href="#" className="text-primary small">
              Forgot password?
            </a>
          </div>
        </form>

        <p className="text-center mt-4">
          Don't have an account?{" "}
          <a href="/registration" className="text-primary">
            Register now
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
