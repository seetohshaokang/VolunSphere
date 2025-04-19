// client/src/containers/Auth/ForgotPassword/index.jsx
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
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Api from "../../../helpers/Api";

const ForgotPassword = () => {
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

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
			toast.success(
				"Password reset email sent. Please check your inbox."
			);

			setMessage("Password reset email sent. Please check your inbox.");
			setEmail("");
		} catch (err) {
			toast.error(err.message || "Something went wrong");
			setError(err.message || "Something went wrong");
		} finally {
			setLoading(false);
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
						Reset Password
					</CardTitle>
					<CardDescription className="text-center text-white/80">
						Enter your email to receive a reset link
					</CardDescription>
				</CardHeader>

				<CardContent className="pt-6">
					{/* {message && (
						<Alert className="mb-4 border border-green-500 bg-green-100 text-green-700 px-4 py-3 rounded">
							<AlertDescription>{message}</AlertDescription>
						</Alert>
					)}

					{error && (
						<Alert className="mb-4 border border-red-500 bg-red-100 text-red-700 px-4 py-3 rounded">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)} */}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email" className="text-gray-700">
								Email Address
							</Label>
							<Input
								type="email"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="border-[#0066FF]/30 focus:border-[#0066FF] focus:ring-[#0066FF]/20"
								required
								placeholder="Enter your email address"
							/>
						</div>

						<Button
							type="submit"
							disabled={loading}
							className="w-full bg-[#0066FF] hover:bg-[#0055DD] text-white"
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
					</form>
				</CardContent>
				<CardFooter className="flex justify-center pb-6 pt-2">
					<p className="text-center text-gray-600">
						Remember your password?{" "}
						<Link
							to="/login"
							className="text-[#0066FF] font-semibold hover:underline"
						>
							Back to Login
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
};

export default ForgotPassword;
