import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../../helpers/Api";
import styles from "../../../styles/Registration.module.css";

function Registration() {
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

	// Get the API URL from environment variables
	const apiUrl = import.meta.env.VITE_API_URL;

	// Function to fetch data from the backend
	const fetchData = async () => {
		try {
			const response = await Api.testConnection();
			console.log("Full Response", response);

			if (response.data) {
				const { message, data } = response.data;
				console.log(message, data);
				setMessage(message);
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

	// Call the fetchData function when the component mounts
	useEffect(() => {
		fetchData();
		const handleResize = () => setIsMobile(window.innerWidth <= 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<div
			className={`container-fluid vh-100 d-flex align-items-center justify-content-center ${styles.splitBackground}`}
		>
			<h1
				className={`fw-bold position-absolute top-0 start-50 translate-middle-x mt-4 display-4 ${styles.splitTitle}`}
			>
				<span className="text-white me-2">VOLUN</span>
				<span
					className={`text-primary ms-2 ${
						isMobile ? styles.sphereToWhite : ""
					}`}
				>
					SPHERE
				</span>
			</h1>

			<div className="row w-75 align-items-center">
				{/* Left Section */}
				<div
					className={`col-md-6 text-white text-center d-flex flex-column justify-content-center align-items-center p-5 ${styles.colMd6}`}
				>
					<h2
						className={`fw-bold me-2 ${
							isMobile ? styles.colMd6h2Mobile : styles.colMd6h2
						}`}
					>
						I want to find volunteers
					</h2>
					<button
						onClick={() => navigate("/registrationorganiser")}
						className={`${
							isMobile
								? styles.btnCustomWhite
								: styles.btnCustomWhite
						}`}
					>
						SIGN UP AS ORGANISER
					</button>
				</div>

				{/* Image */}
				<div
					className={`col-md-3 d-flex justify-content-left align-items-left ${
						isMobile
							? styles.curvedContainerMobile
							: styles.curvedContainer
					}`}
				>
					<img
						src="/src/assets/helping-hand.svg"
						alt="Helping Hand"
						className={`img-fluid ${styles.curvedImage}`}
					/>
				</div>

				{/* Right Section */}
				<div
					className={`col-md-6 text-primary text-center d-flex flex-column justify-content-center align-items-center p-5 ${styles.colMd6}`}
				>
					<h2
						className={`fw-bold mb-3 ${
							isMobile ? styles.colMd6h1Mobile : styles.colMd6h1
						}`}
					>
						I want to help others
					</h2>
					<button
						onClick={() => navigate("/registrationvolunteer")}
						className={`${
							isMobile
								? styles.btnCustomWhite
								: styles.btnCustomBlue
						}`}
					>
						SIGN UP AS VOLUNTEER
					</button>
				</div>
			</div>
		</div>
	);
}

export default Registration;
