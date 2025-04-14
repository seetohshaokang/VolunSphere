// server/middleware/nricUploadMiddleware.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { ApiError } = require("./errorMiddleware");

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "../public/uploads/nric");
fs.mkdirSync(uploadDir, { recursive: true });

// Configure storage strategy - store on disk like profile and event images
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadDir);
	},
	filename: function (req, file, cb) {
		// Generate unique filename with timestamp and random number
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, "nric-" + uniqueSuffix + ext);
	},
});

// File filter function to validate uploads
const fileFilter = (req, file, cb) => {
	// Accept images only
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
		return cb(
			new ApiError(
				"Only image files (jpg, jpeg, png, gif) are allowed!",
				400
			),
			false
		);
	}

	// Check mimetype as additional validation
	if (!file.mimetype.startsWith("image/")) {
		return cb(new ApiError("File must be an image!", 400), false);
	}

	cb(null, true);
};

// Initialize multer upload
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
	},
	fileFilter: fileFilter,
}).single("nric_image"); // Field name for the NRIC image

/**
 * Middleware for handling NRIC image uploads
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const nricUploadMiddleware = (req, res, next) => {
	upload(req, res, (err) => {
		if (err) {
			if (err instanceof multer.MulterError) {
				// A Multer error occurred when uploading
				if (err.code === "LIMIT_FILE_SIZE") {
					return res.status(400).json({
						message: "File is too large. Maximum size is 5MB.",
					});
				}
				return res.status(400).json({
					message: `Upload error: ${err.message}`,
				});
			} else if (err instanceof ApiError) {
				// Our custom ApiError
				return res
					.status(err.statusCode)
					.json({ message: err.message });
			} else {
				// Unknown error
				return res.status(500).json({
					message: `Unknown error: ${err.message}`,
				});
			}
		}
		// Everything went fine
		next();
	});
};

module.exports = nricUploadMiddleware;
