// client/src/containers/Auth/ResetPassword/index.jsx
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Api from "../../../helpers/Api";

const ResetPassword = () => {
	const { token } = useParams();
	const navigate = useNavigate();
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	// You might want to verify the token on component mount
	// This is optional since your API will verify it when resetting
	useEffect(() => {
		if (!token) {
			setError("Invalid reset token");
		}
	}, [token]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (newPassword.length < 6) {
			setError("Password must be at least 6 characters long");
			return;
		}

		setLoading(true);
		setMessage("");
		setError("");

		try {
			const response = await Api.resetPassword(token, newPassword);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to reset password");
			}

			setMessage("Password reset successful! Redirecting to login...");

			// Redirect to login page after 3 seconds
			setTimeout(() => {
				navigate("/login");
			}, 3000);
		} catch (err) {
			setError(err.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	if (!token) {
		return (
			<div className="max-w-md mx-auto px-4 py-8">
				<Card>
					<CardContent className="pt-6">
						<Alert variant="destructive">
							<AlertDescription>
								Invalid reset link
							</AlertDescription>
						</Alert>
						<div className="mt-4 text-center">
							<Link
								to="/forgot-password"
								className="text-primary hover:underline"
							>
								Request a new password reset
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="max-w-md mx-auto px-4 py-8">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl font-bold">
						Reset Password
					</CardTitle>
				</CardHeader>

				<CardContent>
					{message && (
						<Alert variant="success" className="mb-4">
							<AlertDescription>{message}</AlertDescription>
						</Alert>
					)}

					{error && (
						<Alert variant="destructive" className="mb-4">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<form onSubmit={handleSubmit}>
						<div className="mb-4">
							<Label htmlFor="newPassword" className="block mb-2">
								New Password
							</Label>
							<Input
								type="password"
								id="newPassword"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className="w-full"
								required
								minLength="6"
								placeholder="Enter new password"
							/>
						</div>

						<div className="mb-6">
							<Label
								htmlFor="confirmPassword"
								className="block mb-2"
							>
								Confirm New Password
							</Label>
							<Input
								type="password"
								id="confirmPassword"
								value={confirmPassword}
								onChange={(e) =>
									setConfirmPassword(e.target.value)
								}
								className="w-full"
								required
								minLength="6"
								placeholder="Confirm new password"
							/>
						</div>

						<Button
							type="submit"
							disabled={loading}
							className="w-full"
						>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Resetting...
								</>
							) : (
								"Reset Password"
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default ResetPassword;
