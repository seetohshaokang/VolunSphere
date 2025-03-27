const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.memoryStorage(); // Store files in memory

const upload = multer({
	// Initialize upload
	storage: storage,
	limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
	fileFilter: (req, file, cb) => {
		const filetypes = /jpeg|jpg|png/; // Allowed file types
		const extname = filetypes.test(
			path.extname(file.originalname).toLowerCase()
		);
		const mimetype = filetypes.test(file.mimetype);

		if (mimetype && extname) {
			return cb(null, true);
		} else {
			cb(
				"Error: File upload only supports images of type JPEG, JPG, PNG, or GIF!"
			);
		}
	},
}).single("profile_picture"); // 'profile_picture' is the name of the file input field

module.exports = (req, res, next) => {
	upload(req, res, (err) => {
		if (err) {
			return res.status(400).json({ error: err.message });
		}
		next(); // Call the next middleware or route handler
	});
};
