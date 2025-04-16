// client/src/containers/Auth/ForgotPassword/index.jsx
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Api from "../../../helpers/Api";

const ForgotPassword = () => {
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");
		setError("");

		try {
			const response = await Api.requestPasswordReset(email);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					data.message || "Failed to request password reset"
				);
			}

			setMessage("Password reset email sent. Please check your inbox.");
			setEmail("");
		} catch (err) {
			setError(err.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto px-4 py-8">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl font-bold">
						Forgot Password
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
							<Label htmlFor="email" className="block mb-2">
								Email Address
							</Label>
							<Input
								type="email"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full"
								required
								placeholder="Enter your email address"
							/>
						</div>

						<div className="flex flex-col space-y-4">
							<Button
								type="submit"
								disabled={loading}
								className="w-full"
							>
								{loading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Sending...
									</>
								) : (
									"Send Reset Link"
								)}
							</Button>

							<div className="text-center">
								<Link
									to="/login"
									className="text-sm text-primary hover:underline"
								>
									Back to Login
								</Link>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default ForgotPassword;
