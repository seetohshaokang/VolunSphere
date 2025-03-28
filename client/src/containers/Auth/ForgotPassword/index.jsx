// src/containers/Auth/ForgotPassword/index.jsx
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
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [validated, setValidated] = useState(false);

	const apiUrl = import.meta.env.VITE_API_URL;

	const handleSubmit = async (event) => {
		event.preventDefault();
		const form = event.currentTarget;

		if (form.checkValidity() === false) {
			event.stopPropagation();
		} else {
			try {
				// Simulating successful password reset
				setMessage(
					"Password reset successful. You can now log in with your new password."
				);
				setError("");

				// In a real app, you might redirect after successful reset
				setTimeout(() => {
					navigate("/login");
				}, 3000);
			} catch (err) {
				console.error("Error submitting password reset:", err);
				setError(
					"Failed to reset password. Please verify your email and current password."
				);
				setMessage("");
			}
		}
		setValidated(true);
	};

	return (
		<div className="min-h-screen flex justify-center items-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">
						VolunSphere
					</CardTitle>
					<CardDescription className="text-center">
						Reset your password
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
							<Label htmlFor="currentPassword">
								Current Password
							</Label>
							<Input
								id="currentPassword"
								type="password"
								placeholder="Enter current password"
								value={currentPassword}
								onChange={(e) =>
									setCurrentPassword(e.target.value)
								}
								required
							/>
							{validated && !currentPassword && (
								<p className="text-sm text-destructive">
									Current password is required.
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="newPassword">New Password</Label>
							<Input
								id="newPassword"
								type="password"
								placeholder="Enter new password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								required
							/>
							{validated && !newPassword && (
								<p className="text-sm text-destructive">
									New password is required.
								</p>
							)}
						</div>

						<Button type="submit" className="w-full">
							Reset Password
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex justify-center">
					<p className="text-center">
						Remembered your password?{" "}
						<a
							href="/login"
							className="text-primary font-semibold hover:underline"
						>
							Log in
						</a>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}

export default ForgotPassword;
