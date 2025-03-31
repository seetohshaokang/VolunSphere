const passport = require("passport");
const Admin = require("../models/Admin");

/**
 * Middleware to protect routes with JWT authentication
 */
exports.protectRoute = (req, res, next) => {
	console.log("🔒 Auth Middleware Called");
	console.log("🔑 Authorization Header:", req.headers.authorization);

	passport.authenticate("jwt", { session: false }, (err, user, info) => {
		console.log("🔍 Passport Auth Result:", {
			error: err ? "Yes" : "No",
			user: user ? "Found" : "Not found",
			info: info,
		});

		if (err) {
			console.log("❌ Auth Error:", err);
			return next(err);
		}

		if (!user) {
			console.log(
				"❌ Authentication failed:",
				info ? info.message : "No user found"
			);
			return res.status(401).json({
				message: "Unauthorized",
				details: info ? info.message : "Authentication failed",
			});
		}

		req.user = user;
		console.log("✅ Auth successful for user:", user.email);
		next();
	})(req, res, next);
};

/**
 * Middleware to restrict access based on user role
 */
exports.requireRole = (roles) => {
	return (req, res, next) => {
		console.log("👤 Role Check:", req.user ? req.user.role : "No user");

		// Ensure user is authenticated
		if (!req.user) {
			console.log("❌ No user for role check");
			return res.status(401).json({ message: "Authentication required" });
		}

		// Roles can be a single string or an array of strings
		const allowedRoles = Array.isArray(roles) ? roles : [roles];
		console.log(
			"🔍 Checking if role",
			req.user.role,
			"is in",
			allowedRoles
		);

		if (!allowedRoles.includes(req.user.role)) {
			console.log("❌ Role check failed");
			return res.status(403).json({
				message: `Access denied. ${allowedRoles.join(
					" or "
				)} role required.`,
			});
		}

		console.log("✅ Role check passed");
		next();
	};
};

/**
 * Middleware to check admin permissions
 */
exports.requirePermission = (permission) => {
	return async (req, res, next) => {
		try {
			// Ensure user is authenticated
			if (!req.user) {
				return res
					.status(401)
					.json({ message: "Authentication required" });
			}

			// Check if user is admin
			if (req.user.role !== "admin") {
				return res
					.status(403)
					.json({ message: "Admin access required" });
			}

			// Get admin details
			const admin = await Admin.findOne({ user_id: req.user._id });

			if (!admin) {
				return res
					.status(403)
					.json({ message: "Admin profile not found" });
			}

			// Check if admin has the required permission
			// Supervisors have all permissions
			if (
				admin.role === "supervisor" ||
				admin.permissions.includes(permission)
			) {
				req.admin = admin;
				next();
			} else {
				return res.status(403).json({
					message: `Access denied. '${permission}' permission required.`,
				});
			}
		} catch (error) {
			console.error("Permission middleware error:", error);
			return res.status(500).json({ message: "Server error" });
		}
	};
};
