import axios from "axios";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./LoginOrganiser.css";

function LoginOrganiser() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState(""); // Store success message
  const [error, setError] = useState(""); // Store error message

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
    </div>
  );
}

export default LoginOrganiser;
