import axios from 'axios'; // Import Axios
import { useEffect, useState } from 'react';
import './App.css';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState(''); // Store success message
  const [error, setError] = useState(''); // Store error message

  // Get the API URL from environment variables
  const apiUrl = import.meta.env.VITE_API_URL;

  // Function to fetch data from the backend
  const fetchData = async () => {
    try {
      const response = axios.get(`${apiUrl}/test-connection`);
      console.log(response.data); // Log the data from the API
      setMessage(response.data.message); // Display the message from the response
      setError(''); // Clear any previous error
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
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
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
