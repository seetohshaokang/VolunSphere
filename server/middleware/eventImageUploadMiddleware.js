// middleware/eventImageUploadMiddleware.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join("public", "uploads", "events");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "event-" + uniqueSuffix + ext);
  },
});

// Initialize upload middleware
const uploadEventImage = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Allow only images
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images (JPEG, JPG, PNG, GIF, WEBP) are allowed!"));
    }
  },
}).single("event_image"); // 'event_image' field will be used in the form

// Export as middleware function
module.exports = (req, res, next) => {
  uploadEventImage(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // If file was uploaded, add image_url to the request body
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      req.body.image_url = `${baseUrl}/uploads/events/${req.file.filename}`;
    }

    next();
  });
};
