/**
 * Gets the user's profile image URL with cache busting
 *
 * @param {Object} user - The user object from auth context
 * @param {string|null} profilePictureUrl - The profile picture URL from the profile data
 * @param {number} timestamp - Optional timestamp for cache busting
 * @returns {string} The URL to the user's profile image
 */
export const getProfileImageUrl = (
	user,
	profilePictureUrl,
	timestamp = Date.now()
) => {
	if (!profilePictureUrl) {
		// Return default images based on user role
		if (user?.role === "organiser") {
			return "/src/assets/default-avatar-red.png";
		} else if (user?.role === "admin") {
			return "/src/assets/default-avatar-green.png";
		} else {
			return "/src/assets/default-avatar-blue.png";
		}
	}

	// If it's a full URL
	if (profilePictureUrl.startsWith("http")) {
		return `${profilePictureUrl}?t=${timestamp}`;
	}

	// If it's a relative path with a file extension
	if (profilePictureUrl.startsWith("/") || profilePictureUrl.includes(".")) {
		// Determine if it's a server-hosted image or a local asset
		if (
			profilePictureUrl.startsWith("/uploads/") ||
			profilePictureUrl.includes("profile-")
		) {
			return `http://localhost:8000${
				profilePictureUrl.startsWith("/") ? "" : "/uploads/profiles/"
			}${profilePictureUrl}?t=${timestamp}`;
		}
		return `${profilePictureUrl}?t=${timestamp}`;
	}

	// If it's just a filename (most likely from server)
	return `http://localhost:8000/uploads/profiles/${profilePictureUrl}?t=${timestamp}`;
};

/**
 * Gets the initials from a user's name
 *
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @returns {string} User's initials
 */
export const getUserInitials = (firstName, lastName) => {
	const firstInitial = firstName?.charAt(0) || "";
	const lastInitial = lastName?.charAt(0) || "";

	return firstInitial + lastInitial || "U";
};
