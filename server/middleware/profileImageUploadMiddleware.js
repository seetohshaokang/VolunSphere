const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join("public", "uploads", "profiles");
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadDir);
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, "profile-" + uniqueSuffix + ext);
	},
});

// Configure file filter and limits
const uploadProfileImage = multer({
	storage: storage,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
	fileFilter: (req, file, cb) => {
		const filetypes = /jpeg|jpg|png|webp/;
		const mimetype = filetypes.test(file.mimetype);
		const extname = filetypes.test(
			path.extname(file.originalname).toLowerCase()
		);

		if (mimetype && extname) {
			return cb(null, true);
		} else {
			cb(new Error("Only JPEG, JPG, PNG, and WEBP images are allowed!"));
		}
	},
}).single("profile_picture"); // 'profile_picture' field will be used in the form

// Middleware function
module.exports = (req, res, next) => {
	console.log("👉 Profile image upload middleware triggered");

	uploadProfileImage(req, res, (err) => {
		if (err) {
			console.error("❌ Multer error:", err.message);
			return res.status(400).json({ error: err.message });
		}

		if (req.file) {
			console.log(
				"✅ Profile image uploaded successfully:",
				req.file.filename
			);

			// Set image_url in the request body - Note that we're only setting the filename now
			// The full URL will be handled by the controller
			req.body.image_url = req.file.filename;
		} else {
			console.log("ℹ️ No profile image file uploaded");
		}

		next();
	});
};
