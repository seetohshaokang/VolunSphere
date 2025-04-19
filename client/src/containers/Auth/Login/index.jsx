// src/containers/Auth/Login/index.jsx
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
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import Api from "../../../helpers/Api";

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [validated, setValidated] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

	// Handle window resize for responsive design
	useEffect(() => {
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

				toast.success("Login successful!");

				// Navigate based on role
				if (data.user.role === "organiser") {
					navigate("/organizer");
				} else if (data.user.role === "admin") {
					navigate("/admin");
				} else {
					navigate("/");
				}
			} else {
				toast.error(data.message || "Login failed");
				setError(data.message || "Login failed");
			}
		} catch (err) {
			console.error("Login error:", err);
			toast.error("An error occurred during login");
			setError("An error occurred during login");
		}
	};

	return (
		<div className="min-h-screen bg-[#0066FF]/10 flex flex-col justify-center items-center p-4 relative">
			{/* Back to Home Button */}
			<Button
				variant="ghost"
				className="absolute top-4 left-4 flex items-center gap-2 text-[#0066FF] hover:bg-[#0066FF]/10"
				onClick={() => navigate("/")}
			>
				<ArrowLeft className="h-4 w-4" />
				Back to Home
			</Button>

			{/* Title */}
			<div className="mb-8">
				<div className="flex items-center">
					<h1 className="text-3xl font-bold text-[#0066FF]">
						VOLUNSPHERE
					</h1>
				</div>
			</div>

			<Card className="w-full max-w-md border-[#0066FF]/20 shadow-lg">
				<CardHeader className="space-y-1 bg-[#0066FF] text-white rounded-t-lg">
					<CardTitle className="text-2xl font-bold text-center">
						Welcome Back
					</CardTitle>
					<CardDescription className="text-center text-white/80">
						Log in to your account
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-6">
					{/* {error && (
						<Alert className="mb-4 border border-red-500 bg-red-100 text-red-700 px-4 py-3 rounded">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)} */}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email" className="text-gray-700">
								Email address
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="border-[#0066FF]/30 focus:border-[#0066FF] focus:ring-[#0066FF]/20"
							/>
							{validated && !email && (
								<p className="text-sm text-destructive">
									Please enter a valid email.
								</p>
							)}
						</div>

						<div className="space-y-2">
							<div className="flex justify-between">
								<Label
									htmlFor="password"
									className="text-gray-700"
								>
									Password
								</Label>
								<Link
									to="/forgot-password"
									className="text-sm text-[#0066FF] hover:underline"
								>
									Forgot password?
								</Link>
							</div>
							<Input
								id="password"
								type="password"
								placeholder="Enter your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="border-[#0066FF]/30 focus:border-[#0066FF] focus:ring-[#0066FF]/20"
							/>
							{validated && !password && (
								<p className="text-sm text-destructive">
									Password is required.
								</p>
							)}
						</div>

						<Button
							type="submit"
							className="w-full bg-[#0066FF] hover:bg-[#0055DD] text-white"
						>
							Log in
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex justify-center pb-6 pt-2">
					<p className="text-center text-gray-600">
						Don't have an account?{" "}
						<Link
							to="/registration"
							className="text-[#0066FF] font-semibold hover:underline"
						>
							Register now
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}

export default Login;
