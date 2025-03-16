import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap"; // Bootstrap Validation
import styles from "../../styles/RegistrationVolunteer.module.css";

function RegistrationVolunteer() {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		dateOfBirth: "",
		password: "",
		terms: false,
	});

	const [showModal, setShowModal] = useState(false);
	const [modalMessages, setModalMessages] = useState([]);
	const [showTermsModal, setShowTermsModal] = useState(false); // Terms & Conditions Modal

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		// Prevent the modal click from affecting the checkbox state
		if (name !== "terms") {
			setFormData({
				...formData,
				[name]: type === "checkbox" ? checked : value,
			});
		}
	};

	const validateForm = () => {
		let errors = [];
		if (!formData.firstName) errors.push("First name is required.");
		if (!formData.lastName) errors.push("Last name is required.");
		if (!formData.email) errors.push("Email is required.");
		if (!formData.phone) errors.push("Phone number is required.");
		if (!formData.dateOfBirth) errors.push("Date of Birth is required.");
		if (!formData.password) errors.push("Password is required.");
		if (!formData.terms)
			errors.push("You must agree to the terms and conditions.");
		return errors;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const validationErrors = validateForm();

		if (validationErrors.length > 0) {
			setModalMessages(validationErrors);
			setShowModal(true);
		} else {
			setModalMessages(["Registration Successful!"]);
			setShowModal(true);
		}
	};

	return (
		<div className={`container-fluid ${styles.wrapper}`}>
			<div className="row vh-100">
				{/* Company Description */}
				<div
					className={`col-12 col-md-6 d-flex flex-column justify-content-center align-items-center text-white text-center p-5 ${styles.bgPrimary}`}
				>
					<h1 className="fw-bold">VolunSphere</h1>
					<p className="mt-3">
						We connect passionate individuals with meaningful
						volunteer opportunities.
					</p>
					<p>
						Make an impact, give back, and be part of a community
						that cares.
					</p>
					<p>
						Join us in creating positive change—one volunteer at a
						time.
					</p>
				</div>

				{/* Registration Form */}
				<div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
					<div className={`card p-4 shadow ${styles.formContainer}`}>
						<h3 className="text-center">Registration</h3>
						<form onSubmit={handleSubmit}>
							<div className="mb-3">
								<label className="form-label">
									First Name *
								</label>
								<input
									type="text"
									name="companyName"
									className="form-control"
									placeholder="Company Name"
									value={formData.companyName}
									onChange={handleChange}
								/>
							</div>

							<div className="mb-3">
								<label className="form-label">
									Last Name *
								</label>
								<input
									type="text"
									name="companyName"
									className="form-control"
									placeholder="Company Name"
									value={formData.companyName}
									onChange={handleChange}
								/>
							</div>

							<div className="mb-3">
								<label className="form-label">Email *</label>
								<input
									type="email"
									name="email"
									className="form-control"
									placeholder="name@example.com"
									value={formData.email}
									onChange={handleChange}
								/>
							</div>

							<div className="mb-3">
								<label className="form-label">
									Phone Number *
								</label>
								<input
									type="tel"
									name="phone"
									className="form-control"
									placeholder="Phone Number"
									value={formData.phone}
									onChange={handleChange}
								/>
							</div>

							<div className="mb-3">
								<label className="form-label">
									Date of Birth *
								</label>
								<input
									type="date"
									name="dateOfBirth"
									className="form-control"
									value={formData.dateOfBirth}
									onChange={handleChange}
								/>
							</div>

							<div className="mb-3">
								<label className="form-label">Password *</label>
								<input
									type="password"
									name="password"
									className="form-control"
									value={formData.password}
									onChange={handleChange}
								/>
							</div>

							<div className="mb-3 form-check">
								<input
									type="checkbox"
									name="terms"
									className="form-check-input"
									id="terms"
									checked={formData.terms}
									onChange={(e) =>
										setFormData({
											...formData,
											terms: e.target.checked,
										})
									}
								/>
								<label
									className="form-check-label"
									htmlFor="terms"
								>
									I agree to the{" "}
									<span
										className="text-primary"
										style={{ cursor: "pointer" }}
										onClick={(e) => {
											e.preventDefault();
											setShowTermsModal(true);
										}}
									>
										terms and conditions
									</span>
								</label>
							</div>

							<button
								type="submit"
								className="btn btn-primary w-100"
							>
								Sign up
							</button>
						</form>

						{/* Already have an account? Login here */}
						<p className="text-center mt-3">
							Already have an account?{" "}
							<a href="/login" className="text-primary">
								Login here
							</a>
						</p>
					</div>
				</div>
			</div>

			{/* Bootstrap Validation Modal */}
			<Modal show={showModal} onHide={() => setShowModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>Validation Error</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{modalMessages.length > 1 ? (
						<>
							<h5 className="text-danger">
								Please fill out the following fields:
							</h5>
							<ul className="text-start">
								{modalMessages.map((msg, index) => (
									<li key={index} className="text-danger">
										{msg}
									</li>
								))}
							</ul>
						</>
					) : (
						<h5 className="text-success">{modalMessages[0]}</h5>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant="primary"
						onClick={() => setShowModal(false)}
					>
						OK
					</Button>
				</Modal.Footer>
			</Modal>

			{/* Terms and Conditions Modal */}
			<Modal
				show={showTermsModal}
				onHide={() => setShowTermsModal(false)}
				centered
				size="lg"
			>
				<Modal.Header closeButton>
					<Modal.Title>Terms and Conditions</Modal.Title>
				</Modal.Header>
				<Modal.Body
					className="overflow-auto"
					style={{ maxHeight: "400px" }}
				>
					<p>
						Welcome to VolunSphere. Please read the following terms
						and conditions carefully:
					</p>
					<ul>
						<li>
							You must provide accurate and complete information.
						</li>
						<li>
							Your data will be used in compliance with privacy
							laws.
						</li>
						<li>
							VolunSphere is not liable for any damages caused by
							volunteering activities.
						</li>
						<li>
							By registering, you agree to receive communications
							about volunteering opportunities.
						</li>
						<li>
							Failure to comply with our guidelines may result in
							account suspension.
						</li>
					</ul>
					<p>For further inquiries, contact our support team.</p>
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant="primary"
						onClick={() => setShowTermsModal(false)}
					>
						Done
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
}

export default RegistrationVolunteer;
