import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Profile.css";
import Navbar from "./Navbar";

const EditProfile = () => {
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Lim",
    email: "john.lim@gmail.com",
    phone: "9123 4567",
    dob: "2000-01-01",
    bio: "I am always looking for ways to help out the community",
    avatar: "https://via.placeholder.com/150"
  });

  const [isEditing, setIsEditing] = useState(false);

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
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  return (
    <div>
      <Navbar />
      <div className="container profile-container" style={{ paddingTop: '70px' }}>
        <h2>Profile</h2>
        <div className="text-center mb-4">
          <img src={profile.avatar} alt="Profile" className="profile-img" />
        </div>
        {!isEditing ? (
          <div className="profile-details">
            <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Phone:</strong> {profile.phone}</p>
            <p><strong>Date of Birth:</strong> {profile.dob}</p>
            <p><strong>Bio:</strong> {profile.bio}</p>
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="mb-3">
              <label className="form-label">Profile Picture:</label>
              <input type="file" className="form-control" onChange={handleFileChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">First Name:</label>
              <input type="text" className="form-control" name="firstName" value={profile.firstName} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Last Name:</label>
              <input type="text" className="form-control" name="lastName" value={profile.lastName} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Email:</label>
              <input type="email" className="form-control" name="email" value={profile.email} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone Number:</label>
              <input type="tel" className="form-control" name="phone" value={profile.phone} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Date of Birth:</label>
              <input type="date" className="form-control" name="dob" value={profile.dob} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Bio:</label>
              <textarea className="form-control" name="bio" value={profile.bio} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-success">Save Changes</button>
            <button type="button" className="btn btn-secondary ms-2" onClick={() => setIsEditing(false)}>Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProfile;