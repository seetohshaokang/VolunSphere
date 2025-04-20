const mongoose = require("mongoose");

exports.notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

exports.errorHandler = (err, req, res, next) => {
  // Log the error
  console.error(`Error: ${err.message}`);
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  // Set status code
  const statusCode = err.status || err.statusCode || 500;

  // Prepare the error response
  const errorResponse = {
    success: false,
    message: err.message || "An unexpected error occurred",
    status: statusCode,
  };

  // Add stack trace in development mode
  if (process.env.NODE_ENV !== "production") {
    errorResponse.stack = err.stack;
  }

  // Handle specific error types
  if (err instanceof mongoose.Error.ValidationError) {
    // Mongoose validation error
    errorResponse.status = 400;
    errorResponse.message = "Validation Error";
    errorResponse.errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err instanceof mongoose.Error.CastError) {
    // Invalid MongoDB ObjectId
    errorResponse.status = 400;
    errorResponse.message = "Invalid ID format";
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    errorResponse.status = 409;
    errorResponse.message = "Duplicate key error";

    // Extract field name from the error message
    const field = Object.keys(err.keyValue)[0];
    errorResponse.details = `The ${field} already exists`;
  } else if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  ) {
    // JWT related errors
    errorResponse.status = 401;
    errorResponse.message = "Authentication error";
    errorResponse.details =
      err.name === "TokenExpiredError"
        ? "Your session has expired. Please log in again."
        : "Invalid authentication token";
  }

  // Send the error response
  res.status(errorResponse.status).json(errorResponse);
};

exports.asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

exports.ApiError = ApiError;
