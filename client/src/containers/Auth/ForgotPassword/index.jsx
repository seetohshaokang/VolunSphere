import React, { useState } from "react";
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
	console.log(`URL is: ${apiUrl}`);

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
			<div className="card bg-base-100 shadow-xl w-full max-w-md">
				<div className="card-body p-6 md:p-8">
					<h2 className="text-2xl font-bold text-center">
						VolunSphere
					</h2>
					<h3 className="text-xl font-semibold text-center mb-4">
						Forgot Password
					</h3>

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
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
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
									Current Password
								</span>
							</label>
							<input
								type="password"
								className="input input-bordered w-full"
								placeholder="Enter current password"
								required
								value={currentPassword}
								onChange={(e) =>
									setCurrentPassword(e.target.value)
								}
							/>
							{validated && !currentPassword && (
								<label className="label">
									<span className="label-text-alt text-error">
										Current password is required.
									</span>
								</label>
							)}
						</div>

						<div className="form-control">
							<label className="label">
								<span className="label-text font-semibold">
									New Password
								</span>
							</label>
							<input
								type="password"
								className="input input-bordered w-full"
								placeholder="Enter new password"
								required
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
							/>
							{validated && !newPassword && (
								<label className="label">
									<span className="label-text-alt text-error">
										New password is required.
									</span>
								</label>
							)}
						</div>

						<button
							type="submit"
							className="btn btn-primary w-full"
						>
							Reset Password
						</button>
					</form>

					<p className="text-center mt-6">
						Remembered your password?{" "}
						<a href="/login" className="text-primary font-semibold">
							Log in
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}

export default ForgotPassword;
