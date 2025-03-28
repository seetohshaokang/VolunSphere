import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import Api from "../../../helpers/Api";

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [validated, setValidated] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

	// Get the API URL from environment variables
	const apiUrl = import.meta.env.VITE_API_URL;

	// Function to fetch data from the backend
	const fetchData = async () => {
		try {
			const response = await Api.testConnection();
			console.log("Full Response", response);

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

	const handleSubmit = async (event) => {
		event.preventDefault();
		const form = event.currentTarget;

		if (form.checkValidity() === false) {
			event.stopPropagation();
			setValidated(true);
			return;
		}

		try {
			// For now, simulate successful login
			const userData = {
				id: "12345",
				name: "Test User",
				email: email,
				role: "volunteer",
			};

			login(userData);
			navigate("/");
		} catch (err) {
			console.error("Login error:", err);
			setError("Invalid email or password");
		}
	};

	return (
		<div className="min-h-screen flex justify-center items-center p-4">
			<div className="card bg-base-100 shadow-xl w-full max-w-md">
				<div className="card-body p-6 md:p-8">
					<h2 className="text-2xl font-bold text-center">
						VolunSphere
					</h2>
					<h3 className="text-xl font-semibold text-center mb-2">
						Log in
					</h3>
					<p className="text-center text-gray-500 mb-6">
						Continue your search for volunteer opportunities
					</p>

					{message && (
						<div className="alert alert-success mb-4">
							{message}
						</div>
					)}
					{error && (
						<div className="alert alert-error mb-4">{error}</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="form-control">
							<label className="label">
								<span className="label-text font-semibold">
									Email address
								</span>
							</label>
							<input
								type="email"
								className="input input-bordered w-full"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
							{validated && !email && (
								<label className="label">
									<span className="label-text-alt text-error">
										Please enter a valid email.
									</span>
								</label>
							)}
						</div>

						<div className="form-control">
							<label className="label">
								<span className="label-text font-semibold">
									Password
								</span>
							</label>
							<input
								type="password"
								className="input input-bordered w-full"
								placeholder="Enter your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
							{validated && !password && (
								<label className="label">
									<span className="label-text-alt text-error">
										Password is required.
									</span>
								</label>
							)}
						</div>

						<button
							type="submit"
							className="btn btn-primary w-full py-3"
						>
							Log in
						</button>

						<div className="text-center mt-2">
							<a
								href="/forgotPassword"
								className="text-primary text-sm"
							>
								Forgot password?
							</a>
						</div>
					</form>

					<p className="text-center mt-6">
						Don't have an account?{" "}
						<a
							href="/registration"
							className="text-primary font-semibold"
						>
							Register now
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}

export default Login;
