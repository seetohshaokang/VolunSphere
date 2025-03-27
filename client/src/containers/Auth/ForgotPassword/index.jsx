import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../styles/ForgotPassword.module.css";

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
				// In a real implementation, use your Api helper
				// const response = await Api.forgotPassword({
				//   email,
				//   currentPassword,
				//   newPassword,
				// });
				// const data = await response.json();

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
		<div
			className={`d-flex justify-content-center align-items-center ${styles.container}`}
		>
			<div className={`card p-5 ${styles.card}`}>
				<h2 className="text-center fw-bold">VolunSphere</h2>
				<h3 className="text-center fw-semibold mb-3">
					Forgot Password
				</h3>

				{message && (
					<div className="alert alert-success">{message}</div>
				)}
				{error && <div className="alert alert-danger">{error}</div>}

				<form
					noValidate
					className={`needs-validation ${
						validated ? "was-validated" : ""
					}`}
					onSubmit={handleSubmit}
				>
					<div className="mb-4">
						<label className="form-label fw-semibold">
							Email address
						</label>
						<input
							type="email"
							className="form-control form-control-lg"
							placeholder="Enter your email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<div className="invalid-feedback">
							Please enter a valid email.
						</div>
					</div>

					<div className="mb-4">
						<label className="form-label fw-semibold">
							Current Password
						</label>
						<input
							type="password"
							className="form-control form-control-lg"
							placeholder="Enter current password"
							required
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
						/>
						<div className="invalid-feedback">
							Current password is required.
						</div>
					</div>

					<div className="mb-4">
						<label className="form-label fw-semibold">
							New Password
						</label>
						<input
							type="password"
							className="form-control form-control-lg"
							placeholder="Enter new password"
							required
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
						/>
						<div className="invalid-feedback">
							New password is required.
						</div>
					</div>

					<button type="submit" className="btn btn-dark w-100 py-3">
						Reset Password
					</button>
				</form>

				<p className="text-center mt-4">
					Remembered your password?{" "}
					<a href="/login" className="text-primary">
						Log in
					</a>
				</p>
			</div>
		</div>
	);
}

export default ForgotPassword;
