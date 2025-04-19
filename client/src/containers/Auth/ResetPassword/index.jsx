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
import { ArrowLeft, Loader2, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import Api from "../../../helpers/Api";

const ResetPassword = () => {
	const { token } = useParams();
	const navigate = useNavigate();
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!token) {
			toast.error("Invalid reset token");
		}
	}, [token]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		if (newPassword.length < 6) {
			toast.error("Password must be at least 6 characters long");
			return;
		}

		setLoading(true);

		try {
			const response = await Api.resetPassword(token, newPassword);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to reset password");
			}

			toast.success("Password reset successful! Redirecting to login...");

			setTimeout(() => {
				navigate("/login");
			}, 3000);
		} catch (err) {
			toast.error(err.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	if (!token) {
		return (
			<div className="min-h-screen bg-[#0066FF]/10 flex flex-col justify-center items-center p-4">
				{/* Back to Home */}
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
					<h1 className="text-3xl font-bold text-[#0066FF]">
						VOLUNSPHERE
					</h1>
				</div>

				<Card className="w-full max-w-md border-[#0066FF]/20 shadow-lg">
					<CardHeader className="bg-[#0066FF] text-white rounded-t-lg">
						<CardTitle className="text-xl font-bold text-center">
							Invalid Reset Link
						</CardTitle>
						<CardDescription className="text-white/80 text-center">
							Your password reset link is invalid or has expired
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-6 flex flex-col items-center gap-4">
						<p className="text-center text-gray-600">
							Please request a new password reset link to continue
						</p>
						<Button
							className="bg-[#0066FF] hover:bg-[#0055DD] text-white"
							onClick={() => navigate("/forgot-password")}
						>
							Request New Link
						</Button>
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
	}

	return (
		<div className="min-h-screen bg-[#0066FF]/10 flex flex-col justify-center items-center p-4 relative">
			{/* Back to Home */}
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
				<h1 className="text-3xl font-bold text-[#0066FF]">
					VOLUNSPHERE
				</h1>
			</div>

			<Card className="w-full max-w-md border-[#0066FF]/20 shadow-lg">
				<CardHeader className="space-y-1 bg-[#0066FF] text-white rounded-t-lg">
					<div className="flex justify-center mb-2">
						<div className="p-2 bg-white/20 rounded-full">
							<LockKeyhole className="h-6 w-6" />
						</div>
					</div>
					<CardTitle className="text-2xl font-bold text-center">
						Reset Password
					</CardTitle>
					<CardDescription className="text-center text-white/80">
						Create a new secure password for your account
					</CardDescription>
				</CardHeader>

				<CardContent className="pt-6">
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label
								htmlFor="newPassword"
								className="text-gray-700"
							>
								New Password
							</Label>
							<Input
								type="password"
								id="newPassword"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className="border-[#0066FF]/30 focus:border-[#0066FF] focus:ring-[#0066FF]/20"
								required
								minLength="6"
								placeholder="Enter new password"
							/>
							<p className="text-xs text-gray-500">
								Password must be at least 6 characters
							</p>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="confirmPassword"
								className="text-gray-700"
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
								className="border-[#0066FF]/30 focus:border-[#0066FF] focus:ring-[#0066FF]/20"
								required
								minLength="6"
								placeholder="Confirm new password"
							/>
						</div>

						<Button
							type="submit"
							disabled={loading}
							className="w-full bg-[#0066FF] hover:bg-[#0055DD] text-white mt-4"
						>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Resetting Password...
								</>
							) : (
								"Reset Password"
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

export default ResetPassword;
