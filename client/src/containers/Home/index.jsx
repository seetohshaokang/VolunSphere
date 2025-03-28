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

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Profile Summary Card */}
				<div className="card bg-base-100 shadow-xl">
					<div className="card-body items-center text-center">
						<div className="avatar">
							<div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
								<img src={profile.avatar} alt="User profile" />
							</div>
						</div>
						<h2 className="card-title mt-2">
							{profile.firstName} {profile.lastName}
						</h2>
						<p className="text-sm opacity-70">
							{user?.role === "volunteer"
								? "Volunteer"
								: "Event Organizer"}
						</p>
					</div>
				</div>

				{/* Profile Details */}
				<div className="md:col-span-2">
					<div className="card bg-base-100 shadow-xl">
						<div className="card-body">
							<div className="flex justify-between items-center mb-4">
								<h2 className="card-title">
									Personal Information
								</h2>
								{!isEditing && (
									<button
										className="btn btn-primary btn-sm"
										onClick={() => setIsEditing(true)}
									>
										Edit Profile
									</button>
								)}
							</div>

							{!isEditing ? (
								<div className="space-y-3">
									<div className="grid grid-cols-3 gap-4">
										<span className="font-bold">Name:</span>
										<span className="col-span-2">
											{profile.firstName}{" "}
											{profile.lastName}
										</span>
									</div>

									<div className="grid grid-cols-3 gap-4">
										<span className="font-bold">
											Email:
										</span>
										<span className="col-span-2">
											{profile.email}
										</span>
									</div>

									<div className="grid grid-cols-3 gap-4">
										<span className="font-bold">
											Phone:
										</span>
										<span className="col-span-2">
											{profile.phone}
										</span>
									</div>

									<div className="grid grid-cols-3 gap-4">
										<span className="font-bold">
											Date of Birth:
										</span>
										<span className="col-span-2">
											{profile.dob}
										</span>
									</div>

									<div className="grid grid-cols-3 gap-4">
										<span className="font-bold">Bio:</span>
										<span className="col-span-2">
											{profile.bio}
										</span>
									</div>
								</div>
							) : (
								<form onSubmit={handleSubmit}>
									<div className="form-control mb-4">
										<label className="label">
											<span className="label-text">
												Profile Picture
											</span>
										</label>
										<input
											type="file"
											className="file-input file-input-bordered w-full"
											onChange={handleFileChange}
										/>
									</div>

									<div className="form-control mb-4">
										<label className="label">
											<span className="label-text">
												First Name
											</span>
										</label>
										<input
											type="text"
											className="input input-bordered"
											name="firstName"
											value={profile.firstName}
											onChange={handleChange}
											required
										/>
									</div>

									<div className="form-control mb-4">
										<label className="label">
											<span className="label-text">
												Last Name
											</span>
										</label>
										<input
											type="text"
											className="input input-bordered"
											name="lastName"
											value={profile.lastName}
											onChange={handleChange}
											required
										/>
									</div>

									<div className="form-control mb-4">
										<label className="label">
											<span className="label-text">
												Email
											</span>
										</label>
										<input
											type="email"
											className="input input-bordered"
											name="email"
											value={profile.email}
											onChange={handleChange}
											required
										/>
									</div>

									<div className="form-control mb-4">
										<label className="label">
											<span className="label-text">
												Phone Number
											</span>
										</label>
										<input
											type="tel"
											className="input input-bordered"
											name="phone"
											value={profile.phone}
											onChange={handleChange}
										/>
									</div>

									<div className="form-control mb-4">
										<label className="label">
											<span className="label-text">
												Date of Birth
											</span>
										</label>
										<input
											type="date"
											className="input input-bordered"
											name="dob"
											value={profile.dob}
											onChange={handleChange}
										/>
									</div>

									<div className="form-control mb-4">
										<label className="label">
											<span className="label-text">
												Bio
											</span>
										</label>
										<textarea
											className="textarea textarea-bordered"
											name="bio"
											value={profile.bio}
											onChange={handleChange}
											rows="3"
										/>
									</div>

									<div className="flex justify-end gap-2">
										<button
											type="button"
											className="btn btn-ghost"
											onClick={() => setIsEditing(false)}
										>
											Cancel
										</button>
										<button
											type="submit"
											className="btn btn-primary"
										>
											Save Changes
										</button>
									</div>
								</form>
							)}
						</div>
					</div>
				</div>

				{/* Activity Section - Volunteer or Organizer specific */}
				<div className="md:col-span-3">
					<div className="card bg-base-100 shadow-xl">
						<div className="card-body">
							<h2 className="card-title mb-4">
								{user?.role === "volunteer"
									? "My Volunteer Activities"
									: "My Organized Events"}
							</h2>

							<div className="overflow-x-auto">
								<table className="table">
									<thead>
										<tr>
											<th>Event</th>
											<th>Date</th>
											<th>Status</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>Beach Cleanup</td>
											<td>Apr 15, 2025</td>
											<td>
												<div className="badge badge-success">
													Active
												</div>
											</td>
											<td>
												<button className="btn btn-sm btn-info mr-2">
													<i className="fas fa-eye"></i>
												</button>
												{user?.role !== "volunteer" && (
													<button className="btn btn-sm btn-warning">
														<i className="fas fa-edit"></i>
													</button>
												)}
											</td>
										</tr>
										<tr>
											<td>Food Bank Assistance</td>
											<td>Mar 20, 2025</td>
											<td>
												<div className="badge badge-primary">
													Upcoming
												</div>
											</td>
											<td>
												<button className="btn btn-sm btn-info mr-2">
													<i className="fas fa-eye"></i>
												</button>
												{user?.role !== "volunteer" && (
													<button className="btn btn-sm btn-warning">
														<i className="fas fa-edit"></i>
													</button>
												)}
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default Profile;
