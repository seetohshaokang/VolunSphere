/**
 * Profile Management Controller
 * Handles user profile operations including fetch, update, and delete
 */
const {
	baseUserOperations,
	volunteerOperations,
	organiserOperations,
	supabase,
} = require("../database");

/**
 * Fetch user profile with role-specific daata
 * @route GET /profile
 */
const fetchProfile = async (req, res) => {
	const user = req.user; // From auth middleware
	try {
		// Get basic user data first
		const basicUserData = await baseUserOperations.getUserByAuthId(user.id);

		if (!basicUserData) {
			return res.status(404).json({ error: "User profile not found" });
		}

		let profileData;

		// Get role-specific profile data
		switch (basicUserData.role) {
			case "volunteer":
				profileData = await volunteerOperations.getVolunteerProfile(
					user.id
				);
				break;
			case "organiser":
				profileData = await organiserOperations.getOrganiserProfile(
					user.id
				);
				break;
			default:
				// For other roles like admin, just return basic data
				profileData = basicUserData;
		}

		return res.json(profileData);
	} catch (error) {
		console.log("Error fetching user profile: ", error);
		return res.status(500).json({
			error: "An error occurred while fetching the profile",
			details: error.message,
		});
	}
};

/**
 * Update profile picture
 * Uses multer middleware for file handling
 * @private
 */
const updateProfilePicture = async (req, res) => {
	const user = req.user; // From auth middleware

	try {
		if (!req.file) {
			return res.status(400).json({ error: "No file uploaded" });
		}

		// Create a unique filename to prevent collisions
		const filePath = `profileimages/${user.id}-${Date.now()}-${
			req.file.originalname
		}`;

		// Upload the new image to storage
		const { data, error } = await supabase.storage
			.from("profileimages")
			.upload(filePath, req.file.buffer, {
				contentType: req.file.mimetype,
			});

		if (error) {
			console.error("Error uploading image:", error);
			return res
				.status(500)
				.json({ error: "Failed to upload profile picture" });
		}

		// Get the public URL of the uploaded image
		const { publicUrl } = supabase.storage
			.from("profileimages")
			.getPublicUrl(filePath);

		// Get the current user data to find existing profile picture
		const { data: userData, error: fetchError } = await supabase
			.from("users")
			.select("profile_picture_url")
			.eq("auth_id", user.id)
			.single();

		if (fetchError) {
			console.error("Error fetching user data:", fetchError);
		}

		// Delete the old profile picture if it exists
		if (userData?.profile_picture_url) {
			// Extract the filename from the URL
			const oldFilePath = userData.profile_picture_url.split("/").pop();

			if (oldFilePath) {
				const { error: deleteError } = await supabase.storage
					.from("profileimages")
					.remove([oldFilePath]);

				if (deleteError) {
					console.error(
						"Error deleting old profile picture:",
						deleteError
					);
					// Non-fatal error, continue with update
				}
			}
		}

		// Update the user's profile picture URL
		const updateData = { profile_picture_url: publicUrl };
		const updatedUser = await baseUserOperations.updateBasicUserInfo(
			user.id,
			updateData
		);

		return res.json({
			message: "Profile picture updated successfully",
			profile_picture_url: publicUrl,
		});
	} catch (error) {
		console.error("Error updating profile picture:", error);
		return res.status(500).json({
			error: "An error occurred while updating the profile picture",
			details: error.message,
		});
	}
};

/**
 * Update user profile
 * @route PUT /profile
 */

const editProfile = async (req, res) => {
	const user = req.user; // From auth middleware

	try {
		// Get the user's current data
		const currentUserData = await baseUserOperations.getUserByAuthId(
			user.id
		);

		if (!currentUserData) {
			return res.status(404).json({ error: "User profile not found" });
		}

		// Extract common profile fields from request
		const { name, dob, phone, bio, address } = req.body;

		// Build updateData with only the fieds that are provided
		const updateData = {};
		if (name !== undefined) updateData.name = name;
		if (dob !== undefined) updateData.dob = dob;
		if (phone !== undefined) updateData.phone = phone;
		if (bio !== undefined) updateData.bio = bio;
		if (address !== undefined) updateData.address = address;

		// Check if there's anything to update
		if (Object.keys(updateData).length === 0 && !req.file) {
			return res
				.status(400)
				.json({ error: "No new data provided for update" });
		}

		// Update profile picture if a file was uploaded
		if (req.file) {
			await updateProfilePicture(req, res);
		}

		// Update the basic user info if there are fields to update
		let updatedUser;
		if (Object.keys(updateData).length > 0) {
			updatedUser = await baseUserOperations.updateBasicUserInfo(
				user.id,
				updateData
			);
		}

		// Handle role-specific updates
		if (currentUserData.role === "volunteer") {
			// Update volunteer skills if provided
			if (req.body.skills) {
				const skills = Array.isArray(req.body.skills)
					? req.body.skills
					: JSON.parse(req.body.skills);

				await volunteerOperations.updateVolunteerSkills(
					currentUserData.id,
					skills
				);
			}
		} else if (currentUserData.role === "organiser") {
			// Update organization details if provided
			if (req.body.organisation) {
				const orgDetails =
					typeof req.body.organisation === "string"
						? JSON.parse(req.body.organisation)
						: req.body.organisation;

				await organiserOperations.updateOrganisationDetails(
					currentUserData.id,
					orgDetails
				);
			}
		}

		// Fetch the updated profile to return
		const updatedProfile = await fetchProfile(req, {
			json: (data) => data,
		});
		return res.json({
			message: "Profile updated successfully",
			data: updatedProfile,
		});
	} catch (error) {
		console.error("Error updating profile:", error);
		return res.status(500).json({
			error: "An error occurred while updating the profile",
			details: error.message,
		});
	}
};

/**
 * Delete user profile
 * @route DELETE /profile
 */
const deleteProfile = async (req, res) => {
	const userId = req.user.id; // From auth middleware

	try {
		// Get the user's current data to check for profile picture
		const userData = await baseUserOperations.getUserByAuthId(userId);

		if (!userData) {
			return res.status(404).json({ error: "User profile not found" });
		}

		// Delete profile picture if it exists
		if (userData.profile_picture_url) {
			const filePath = userData.profile_picture_url.split("/").pop();

			if (filePath) {
				const { error: deleteError } = await supabase.storage
					.from("profileimages")
					.remove([filePath]);

				if (deleteError) {
					console.error(
						"Error deleting profile pciture:",
						deleteError
					);
					// Non-fatal error, continue with deletion
				}
			}
		}

		// Delete the user from the Supabase Auth
		const { error } = await supabase.auth.admin.deleteUser(userId);

		if (error) {
			return res.status(400).json({ error: error.message });
		}

		// Delete the user from the database
		await baseUserOperations.deleteUser(userId);

		return res
			.status(200)
			.json({ message: "Successfully deleted user profile" });
	} catch (error) {
		console.error("Error deleting user profile:", error);
		return res.status(500).json({
			error: "An error occurred while deleting the user",
			details: error.message,
		});
	}
};

module.exports = { fetchProfile, editProfile, deleteProfile };
