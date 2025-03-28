import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function RegistrationOrganiser() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		companyName: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
		terms: false,
	});

	const [showModal, setShowModal] = useState(false);
	const [modalMessages, setModalMessages] = useState([]);
	const [showTermsModal, setShowTermsModal] = useState(false);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData({
			...formData,
			[name]: type === "checkbox" ? checked : value,
		});
	};

	const validateForm = () => {
		let errors = [];
		if (!formData.companyName) errors.push("Company name is required.");
		if (!formData.email) errors.push("Email is required.");
		if (!formData.phone) errors.push("Phone number is required.");
		if (!formData.password) errors.push("Password is required.");
		if (formData.password !== formData.confirmPassword)
			errors.push("Passwords do not match.");
		if (!formData.terms)
			errors.push("You must agree to the terms and conditions.");
		return errors;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const validationErrors = validateForm();

		if (validationErrors.length > 0) {
			setModalMessages(validationErrors);
			setShowModal(true);
		} else {
			try {
				// In a real implementation, use your Api helper
				// const response = await Api.registerUser({
				//   ...formData,
				//   role: "organiser"
				// });
				// const data = await response.json();

				// Simulating successful registration
				setModalMessages([
					"Registration Successful! You can now log in.",
				]);
				setShowModal(true);

				// In a real app, you might redirect after successful registration
				setTimeout(() => {
					navigate("/login");
				}, 2000);
			} catch (err) {
				console.error("Registration error:", err);
				setModalMessages(["Registration failed. Please try again."]);
				setShowModal(true);
			}
		}
	};

	return (
		<div className="min-h-screen flex flex-col md:flex-row">
			{/* Organization Description */}
			<div className="w-full md:w-1/2 bg-primary text-white p-10 flex flex-col justify-center items-center text-center">
				<h1 className="text-3xl font-bold mb-6">VolunSphere</h1>
				<p className="mb-4">
					We connect passionate individuals with meaningful volunteer
					opportunities.
				</p>
				<p className="mb-4">
					Make an impact, give back, and be part of a community that
					cares.
				</p>
				<p>
					Join us in creating positive change—one volunteer at a time.
				</p>
			</div>

			{/* Registration Form */}
			<div className="w-full md:w-1/2 p-6 flex justify-center items-center">
				<div className="card bg-base-100 shadow-xl w-full max-w-md">
					<div className="card-body">
						<h3 className="text-xl font-bold text-center mb-6">
							Organisation Registration
						</h3>
						<form onSubmit={handleSubmit}>
							<div className="form-control mb-4">
								<label className="label">
									<span className="label-text">
										Company Name *
									</span>
								</label>
								<input
									type="text"
									name="companyName"
									className="input input-bordered"
									placeholder="Company Name"
									value={formData.companyName}
									onChange={handleChange}
								/>
							</div>

							<div className="form-control mb-4">
								<label className="label">
									<span className="label-text">Email *</span>
								</label>
								<input
									type="email"
									name="email"
									className="input input-bordered"
									placeholder="name@example.com"
									value={formData.email}
									onChange={handleChange}
								/>
							</div>

							<div className="form-control mb-4">
								<label className="label">
									<span className="label-text">
										Phone Number *
									</span>
								</label>
								<input
									type="tel"
									name="phone"
									className="input input-bordered"
									placeholder="Phone Number"
									value={formData.phone}
									onChange={handleChange}
								/>
							</div>

							<div className="form-control mb-4">
								<label className="label">
									<span className="label-text">
										Password *
									</span>
								</label>
								<input
									type="password"
									name="password"
									className="input input-bordered"
									placeholder="Create a secure password"
									value={formData.password}
									onChange={handleChange}
								/>
							</div>

							<div className="form-control mb-4">
								<label className="label">
									<span className="label-text">
										Confirm Password *
									</span>
								</label>
								<input
									type="password"
									name="confirmPassword"
									className="input input-bordered"
									placeholder="Confirm your password"
									value={formData.confirmPassword}
									onChange={handleChange}
								/>
							</div>

							<div className="form-control mb-6">
								<label className="label cursor-pointer justify-start gap-2">
									<input
										type="checkbox"
										name="terms"
										className="checkbox checkbox-primary"
										checked={formData.terms}
										onChange={(e) =>
											setFormData({
												...formData,
												terms: e.target.checked,
											})
										}
									/>
									<span className="label-text">
										I agree to the{" "}
										<span
											className="text-primary underline cursor-pointer"
											onClick={(e) => {
												e.preventDefault();
												setShowTermsModal(true);
											}}
										>
											terms and conditions
										</span>
									</span>
								</label>
							</div>

							<button
								type="submit"
								className="btn btn-primary w-full"
							>
								Sign up
							</button>
						</form>

						{/* Already have an account? Login here */}
						<p className="text-center mt-6">
							Already have an account?{" "}
							<Link
								to="/login"
								className="text-primary font-semibold"
							>
								Login here
							</Link>
						</p>
					</div>
				</div>
			</div>

			{/* Validation Modal */}
			{showModal && (
				<div className="modal modal-open">
					<div className="modal-box">
						<h3 className="font-bold text-lg">
							{modalMessages.length > 1
								? "Validation Error"
								: "Registration"}
						</h3>
						<div className="py-4">
							{modalMessages.length > 1 ? (
								<>
									<h5 className="text-error font-semibold mb-2">
										Please fix the following issues:
									</h5>
									<ul className="list-disc pl-5">
										{modalMessages.map((msg, index) => (
											<li
												key={index}
												className="text-error"
											>
												{msg}
											</li>
										))}
									</ul>
								</>
							) : (
								<p className="text-success font-semibold">
									{modalMessages[0]}
								</p>
							)}
						</div>
						<div className="modal-action">
							<button
								className="btn btn-primary"
								onClick={() => setShowModal(false)}
							>
								OK
							</button>
						</div>
					</div>
					<div
						className="modal-backdrop"
						onClick={() => setShowModal(false)}
					></div>
				</div>
			)}

			{/* Terms and Conditions Modal */}
			{showTermsModal && (
				<div className="modal modal-open">
					<div className="modal-box max-w-3xl">
						<h3 className="font-bold text-lg">
							Terms and Conditions
						</h3>
						<div className="py-4 max-h-96 overflow-y-auto">
							<p className="mb-4">
								Welcome to VolunSphere. Please read the
								following terms and conditions carefully:
							</p>
							<ul className="list-disc pl-5 space-y-2">
								<li>
									You must provide accurate and complete
									information.
								</li>
								<li>
									Your data will be used in compliance with
									privacy laws.
								</li>
								<li>
									VolunSphere is not liable for any damages
									caused by volunteering activities.
								</li>
								<li>
									By registering, you agree to receive
									communications about volunteering
									opportunities.
								</li>
								<li>
									Failure to comply with our guidelines may
									result in account suspension.
								</li>
							</ul>
							<p className="mt-4">
								For further inquiries, contact our support team.
							</p>
						</div>
						<div className="modal-action">
							<button
								className="btn btn-primary"
								onClick={() => setShowTermsModal(false)}
							>
								Done
							</button>
						</div>
					</div>
					<div
						className="modal-backdrop"
						onClick={() => setShowTermsModal(false)}
					></div>
				</div>
			)}
		</div>
	);
}

export default RegistrationOrganiser;
