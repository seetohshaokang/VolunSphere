// src/containers/Auth/Login/index.jsx
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
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

		try {
			// Send credentials to the server
			const response = await Api.loginUser({ email, password });
			const data = await response.json();

			if (response.ok) {
				// Make sure you're storing the token properly
				localStorage.setItem("token", data.token);

				// Then call your context login function
				login(data.user);

				// Navigate based on role
				if (data.user.role === "organiser") {
					navigate("/organizer");
				} else {
					navigate("/");
				}
			} else {
				setError(data.message || "Login failed");
			}
		} catch (err) {
			console.error("Login error:", err);
			setError("An error occurred during login");
		}
	};

	return (
		<div className="min-h-screen flex justify-center items-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">
						VolunSphere
					</CardTitle>
					<CardDescription className="text-center">
						Continue your search for volunteer opportunities
					</CardDescription>
				</CardHeader>
				<CardContent>
					{message && (
						<Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
							<AlertDescription>{message}</AlertDescription>
						</Alert>
					)}
					{error && (
						<Alert variant="destructive" className="mb-4">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email address</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
							{validated && !email && (
								<p className="text-sm text-destructive">
									Please enter a valid email.
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								placeholder="Enter your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
							{validated && !password && (
								<p className="text-sm text-destructive">
									Password is required.
								</p>
							)}
						</div>

						<Button type="submit" className="w-full">
							Log in
						</Button>

						<div className="text-center">
							<a
								href="/forgotPassword"
								className="text-sm text-primary hover:underline"
							>
								Forgot password?
							</a>
						</div>
					</form>
				</CardContent>
				<CardFooter className="flex justify-center">
					<p className="text-center">
						Don't have an account?{" "}
						<a
							href="/registration"
							className="text-primary font-semibold hover:underline"
						>
							Register now
						</a>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}

export default Login;
