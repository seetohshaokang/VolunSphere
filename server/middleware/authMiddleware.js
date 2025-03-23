const { createClient } = require("@supabase/supabase-js");
const {
	baseUserOperations,
} = require("../config/database");
require("dotenv").config({ path: "./.env.server" });

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_KEY
);

// Middleware to protect routes
const protectRoute = async (req, res, next) => {
	try {
		// Check if Authorization header exists
		if (!req.headers.authorization) {
			return res.status(401).json({
				message: "Unauthorized: No authorization header provided",
			});
		}

		// Check if it follows Bearer token format
		if (!req.headers.authorization.startsWith("Bearer ")) {
			return res.status(401).json({
				message: "Unauthorized: Invalid authorization format",
			});
		}

		// Extract token safely
		const token = req.headers.authorization.split(" ")[1];

		if (!token) {
			return res
				.status(401)
				.json({ message: "Unauthorized: No token provided" });
		}

		// Verify token with Supabase
		const { data, error } = await supabase.auth.getUser(token);

		if (error || !data?.user) {
			return res
				.status(401)
				.json({ message: "Unauthorized: Invalid token" });
		}

		// Get the user from your database using auth_id
		const userData = await baseUserOperations.getUserByAuthId(data.user.id);
		
		if (!userData) {
			return res
				.status(401)
				.json({ message: "Unauthorized: User not found in database" });
		}
		
		// Check if user is banned
		if (userData.status === 'banned') {
			return res
				.status(403)
				.json({ 
					message: "This account has been banned", 
					reason: userData.ban_reason 
				});
		}

		// Attach your database user to request (instead of auth user)
		req.user = userData;
		next();
	} catch (err) {
		console.error("Error in auth middleware:", err.message);
		return res.status(500).json({ message: "Internal server error" });
	}
};

module.exports = { protectRoute };

const isAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        const { data, error } = await supabase
            .from("users")
            .select("role")
            .eq("user_id", req.user.user_id)
            .single();
            
        if (error || !data) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if (data.role !== "admin") {
            return res.status(403).json({ message: "Access denied: Admin role required" });
        }
        
        next();
    } catch (err) {
        console.error("Error in admin middleware:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
module.exports = { protectRoute, isAdmin };
