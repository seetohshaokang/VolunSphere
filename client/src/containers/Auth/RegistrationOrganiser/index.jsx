// src/containers/Auth/RegistrationOrganiser/index.jsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
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
		const { name, value, type } = e.target;
		setFormData({
			...formData,
			[name]: type === "checkbox" ? e.target.checked : value,
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
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="text-xl font-bold text-center">
							Organisation Registration
						</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="companyName">
									Company Name *
								</Label>
								<Input
									id="companyName"
									name="companyName"
									placeholder="Company Name"
									value={formData.companyName}
									onChange={handleChange}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">Email *</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="name@example.com"
									value={formData.email}
									onChange={handleChange}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="phone">Phone Number *</Label>
								<Input
									id="phone"
									name="phone"
									type="tel"
									placeholder="Phone Number"
									value={formData.phone}
									onChange={handleChange}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">Password *</Label>
								<Input
									id="password"
									name="password"
									type="password"
									placeholder="Create a secure password"
									value={formData.password}
									onChange={handleChange}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirmPassword">
									Confirm Password *
								</Label>
								<Input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									placeholder="Confirm your password"
									value={formData.confirmPassword}
									onChange={handleChange}
								/>
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox
									id="terms"
									checked={formData.terms}
									onCheckedChange={(checked) =>
										setFormData({
											...formData,
											terms: !!checked,
										})
									}
								/>
								<Label
									htmlFor="terms"
									className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									I agree to the{" "}
									<span
										className="text-primary underline cursor-pointer"
										onClick={() => setShowTermsModal(true)}
									>
										terms and conditions
									</span>
								</Label>
							</div>

							<Button type="submit" className="w-full">
								Sign up
							</Button>

							<p className="text-center mt-6">
								Already have an account?{" "}
								<Link
									to="/login"
									className="text-primary font-semibold hover:underline"
								>
									Login here
								</Link>
							</p>
						</form>
					</CardContent>
				</Card>
			</div>

			{/* Validation Modal */}
			<Dialog open={showModal} onOpenChange={setShowModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{modalMessages.length > 1
								? "Validation Error"
								: "Registration"}
						</DialogTitle>
						<DialogDescription>
							{modalMessages.length > 1 ? (
								<>
									<p className="text-destructive font-semibold mb-2">
										Please fix the following issues:
									</p>
									<ul className="list-disc pl-5">
										{modalMessages.map((msg, index) => (
											<li
												key={index}
												className="text-destructive"
											>
												{msg}
											</li>
										))}
									</ul>
								</>
							) : (
								<p className="text-green-600 font-semibold">
									{modalMessages[0]}
								</p>
							)}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button onClick={() => setShowModal(false)}>OK</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Terms and Conditions Modal */}
			<Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
				<DialogContent className="max-w-3xl">
					<DialogHeader>
						<DialogTitle>Terms and Conditions</DialogTitle>
					</DialogHeader>
					<div className="py-4 max-h-96 overflow-y-auto">
						<p className="mb-4">
							Welcome to VolunSphere. Please read the following
							terms and conditions carefully:
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
								VolunSphere is not liable for any damages caused
								by volunteering activities.
							</li>
							<li>
								By registering, you agree to receive
								communications about volunteering opportunities.
							</li>
							<li>
								Failure to comply with our guidelines may result
								in account suspension.
							</li>
						</ul>
						<p className="mt-4">
							For further inquiries, contact our support team.
						</p>
					</div>
					<DialogFooter>
						<Button onClick={() => setShowTermsModal(false)}>
							Done
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default RegistrationOrganiser;
