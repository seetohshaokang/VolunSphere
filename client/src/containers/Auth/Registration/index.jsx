import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Registration() {
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth <= 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className={`w-full ${isMobile ? "block" : "flex"}`}>
				{/* Title */}
				<h1
					className={`text-4xl font-bold text-center absolute top-8 left-1/2 transform -translate-x-1/2 ${
						isMobile ? "text-white" : ""
					}`}
				>
					<span className="text-white mr-2">VOLUN</span>
					<span
						className={`${
							isMobile ? "text-white" : "text-primary"
						} ml-2`}
					>
						SPHERE
					</span>
				</h1>

				{/* Left Section - For Organizers */}
				<div
					className={`${
						isMobile ? "min-h-[50vh]" : "min-h-screen w-1/2"
					} flex flex-col justify-center items-center p-10 bg-primary text-white text-center`}
				>
					<h2
						className={`font-bold text-2xl ${
							isMobile ? "mb-8" : "mb-64"
						}`}
					>
						I want to find volunteers
					</h2>
					<button
						onClick={() => navigate("/registrationorganiser")}
						className="border-2 border-white bg-transparent text-white font-semibold text-xl py-4 px-8 rounded-lg hover:bg-white hover:text-primary transition-colors"
					>
						SIGN UP AS ORGANISER
					</button>
				</div>

				{/* Center Image - Only on desktop */}
				{!isMobile && (
					<div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
						<div className="bg-white rounded-full w-60 h-60 flex items-center justify-center overflow-hidden shadow-lg">
							<img
								src="/src/assets/helping-hand.svg"
								alt="Helping Hand"
								className="w-48 h-48 object-contain"
							/>
						</div>
					</div>
				)}

				{/* Right Section - For Volunteers */}
				<div
					className={`${
						isMobile
							? "min-h-[50vh] bg-primary"
							: "min-h-screen w-1/2"
					} flex flex-col justify-center items-center p-10 ${
						isMobile ? "text-white" : "bg-white text-primary"
					} text-center`}
				>
					{/* Mobile image */}
					{isMobile && (
						<div className="mb-12">
							<div className="bg-primary rounded-full w-32 h-32 flex items-center justify-center overflow-hidden">
								<img
									src="/src/assets/helping-hand.svg"
									alt="Helping Hand"
									className="w-24 h-24 object-contain filter invert"
								/>
							</div>
						</div>
					)}

					<h2
						className={`font-bold text-2xl ${
							isMobile ? "mb-8" : "mb-64"
						}`}
					>
						I want to help others
					</h2>
					<button
						onClick={() => navigate("/registrationvolunteer")}
						className={`border-2 font-semibold text-xl py-4 px-8 rounded-lg transition-colors ${
							isMobile
								? "border-white bg-transparent text-white hover:bg-white hover:text-primary"
								: "border-primary bg-transparent text-primary hover:bg-primary hover:text-white"
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
