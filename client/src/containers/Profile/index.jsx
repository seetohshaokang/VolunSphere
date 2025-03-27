import React, { useEffect, useState } from "react";
import ContentHeader from "../../components/ContentHeader";
import { useAuth } from "../../contexts/AuthContext";

function Profile() {
	const { user } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [profile, setProfile] = useState({
		firstName: "John",
		lastName: "Lim",
		email: "john.lim@gmail.com",
		phone: "9123 4567",
		dob: "2000-01-01",
		bio: "I am always looking for ways to help out the community",
		avatar: "https://via.placeholder.com/150",
	});

	useEffect(() => {
		// Fetch user profile from API
		// In real implementation, use your Api helper
		// Api.getUserProfile()
		//   .then(res => res.json())
		//   .then(data => {
		//     setProfile(data);
		//   })
		//   .catch(err => {
		//     console.error("Error fetching profile:", err);
		//   });

		// Simulated profile data - in a real app, remove this
		if (user) {
			setProfile({
				...profile,
				email: user.email || profile.email,
				firstName: user.name
					? user.name.split(" ")[0]
					: profile.firstName,
				lastName: user.name
					? user.name.split(" ")[1] || ""
					: profile.lastName,
			});
		}
	}, [user]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setProfile({ ...profile, [name]: value });
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const imageUrl = URL.createObjectURL(file);
			setProfile({ ...profile, avatar: imageUrl });
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// In real implementation, use your Api helper
		// Api.updateUserProfile(profile)
		//   .then(res => res.json())
		//   .then(data => {
		//     setIsEditing(false);
		//   })
		//   .catch(err => {
		//     console.error("Error updating profile:", err);
		//   });

		// For now, just toggle editing mode
		setIsEditing(false);
		alert("Profile updated successfully!");
	};

	return (
		<>
			<ContentHeader
				title="My Profile"
				links={[
					{ to: "/", label: "Home" },
					{ label: "Profile", isActive: true },
				]}
			/>
			<section className="content">
				<div className="container-fluid">
					<div className="row">
						<div className="col-md-3">
							<div className="card card-primary card-outline">
								<div className="card-body box-profile">
									<div className="text-center">
										<img
											className="profile-user-img img-fluid img-circle"
											src={profile.avatar}
											alt="User profile"
										/>
									</div>
									<h3 className="profile-username text-center">
										{profile.firstName} {profile.lastName}
									</h3>
									<p className="text-muted text-center">
										{user?.role === "volunteer"
											? "Volunteer"
											: "Event Organizer"}
									</p>
								</div>
							</div>
						</div>

						<div className="col-md-9">
							<div className="card">
								<div className="card-header p-2">
									<h3 className="card-title">
										Personal Information
									</h3>
									<div className="card-tools">
										{!isEditing ? (
											<button
												className="btn btn-primary btn-sm"
												onClick={() =>
													setIsEditing(true)
												}
											>
												Edit Profile
											</button>
										) : null}
									</div>
								</div>
								<div className="card-body">
									{!isEditing ? (
										<div className="profile-details">
											<p>
												<strong>Name:</strong>{" "}
												{profile.firstName}{" "}
												{profile.lastName}
											</p>
											<p>
												<strong>Email:</strong>{" "}
												{profile.email}
											</p>
											<p>
												<strong>Phone:</strong>{" "}
												{profile.phone}
											</p>
											<p>
												<strong>Date of Birth:</strong>{" "}
												{profile.dob}
											</p>
											<p>
												<strong>Bio:</strong>{" "}
												{profile.bio}
											</p>
										</div>
									) : (
										<form
											onSubmit={handleSubmit}
											className="edit-form"
										>
											<div className="mb-3">
												<label className="form-label">
													Profile Picture:
												</label>
												<input
													type="file"
													className="form-control"
													onChange={handleFileChange}
												/>
											</div>
											<div className="mb-3">
												<label className="form-label">
													First Name:
												</label>
												<input
													type="text"
													className="form-control"
													name="firstName"
													value={profile.firstName}
													onChange={handleChange}
													required
												/>
											</div>
											<div className="mb-3">
												<label className="form-label">
													Last Name:
												</label>
												<input
													type="text"
													className="form-control"
													name="lastName"
													value={profile.lastName}
													onChange={handleChange}
													required
												/>
											</div>
											<div className="mb-3">
												<label className="form-label">
													Email:
												</label>
												<input
													type="email"
													className="form-control"
													name="email"
													value={profile.email}
													onChange={handleChange}
													required
												/>
											</div>
											<div className="mb-3">
												<label className="form-label">
													Phone Number:
												</label>
												<input
													type="tel"
													className="form-control"
													name="phone"
													value={profile.phone}
													onChange={handleChange}
												/>
											</div>
											<div className="mb-3">
												<label className="form-label">
													Date of Birth:
												</label>
												<input
													type="date"
													className="form-control"
													name="dob"
													value={profile.dob}
													onChange={handleChange}
												/>
											</div>
											<div className="mb-3">
												<label className="form-label">
													Bio:
												</label>
												<textarea
													className="form-control"
													name="bio"
													value={profile.bio}
													onChange={handleChange}
													rows="3"
												/>
											</div>
											<button
												type="submit"
												className="btn btn-success"
											>
												Save Changes
											</button>
											<button
												type="button"
												className="btn btn-secondary ms-2"
												onClick={() =>
													setIsEditing(false)
												}
											>
												Cancel
											</button>
										</form>
									)}
								</div>
							</div>

							{/* Additional sections for volunteer/organizer-specific info */}
							{user?.role === "volunteer" ? (
								<div className="card mt-3">
									<div className="card-header">
										<h3 className="card-title">
											My Volunteer Activities
										</h3>
									</div>
									<div className="card-body">
										<ul className="list-group">
											<li className="list-group-item d-flex justify-content-between align-items-center">
												Beach Cleanup
												<span className="badge bg-primary rounded-pill">
													Apr 15, 2025
												</span>
											</li>
											<li className="list-group-item d-flex justify-content-between align-items-center">
												Food Bank Assistance
												<span className="badge bg-primary rounded-pill">
													Mar 20, 2025
												</span>
											</li>
										</ul>
									</div>
								</div>
							) : (
								<div className="card mt-3">
									<div className="card-header">
										<h3 className="card-title">
											My Organized Events
										</h3>
									</div>
									<div className="card-body">
										<ul className="list-group">
											<li className="list-group-item d-flex justify-content-between align-items-center">
												Beach Cleanup
												<span className="badge bg-primary rounded-pill">
													15 volunteers
												</span>
											</li>
											<li className="list-group-item d-flex justify-content-between align-items-center">
												Food Bank Assistance
												<span className="badge bg-primary rounded-pill">
													10 volunteers
												</span>
											</li>
										</ul>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</section>
		</>
	);
}

export default Profile;
