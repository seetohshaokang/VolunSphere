// server/middleware/documentUploadMiddleware.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { ApiError } = require("./errorMiddleware");

// Create upload directories if they don't exist
const nricUploadDir = path.join(__dirname, "../public/uploads/nric");
const certUploadDir = path.join(__dirname, "../public/uploads/organizer_docs");
fs.mkdirSync(nricUploadDir, { recursive: true });
fs.mkdirSync(certUploadDir, { recursive: true });

/**
 * Create document upload middleware for a specific document type
 * @param {string} fieldName - Form field name for the file
 * @param {string} uploadDir - Directory to upload the file to
 * @param {string} filenamePrefix - Prefix for the generated filename
 * @returns {Function} - Express middleware function
 */
const createDocumentUploadMiddleware = (fieldName, uploadDir, filenamePrefix) => {
  // Configure storage strategy with specific destination
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Generate unique filename with timestamp and random number
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${filenamePrefix}-${uniqueSuffix}${ext}`);
    },
  });

  // File filter function to validate uploads
  const fileFilter = (req, file, cb) => {
    // Accept images and PDFs
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/i)) {
      return cb(
        new ApiError(
          "Only image files (jpg, jpeg, png, gif) and PDF documents are allowed!",
          400
        ),
        false
      );
    }

    // Check mimetype as additional validation
    if (
      !file.mimetype.startsWith("image/") && 
      file.mimetype !== "application/pdf"
    ) {
      return cb(new ApiError("File must be an image or PDF!", 400), false);
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
  }).single(fieldName);

  // Return middleware function
  return (req, res, next) => {
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
};

// Create specific middleware instances for the two document types we need
const nricUploadMiddleware = createDocumentUploadMiddleware(
  "nric_image", 
  nricUploadDir, 
  "nric"
);

const certificationUploadMiddleware = createDocumentUploadMiddleware(
  "certification_document", 
  certUploadDir, 
  "cert"
);

module.exports = {
  nricUploadMiddleware,
  certificationUploadMiddleware
};