require("dotenv").config({ path: "./.env.server" });
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
const passport = require("./config/passport");
const session = require("express-session");
const routes = require("./routes/indexRoutes");
const connectDB = require("./config/database");
const path = require("path");
const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/errorMiddleware");
// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

app.set("trust proxy", 1);

app.use(helmet());

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8000",
  "https://volun-sphere.vercel.app",
  "https://volunsphere.onrender.com",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

app.use(morgan("dev")); // HTTP request logger
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded request bodies
app.use(compression()); // Compress responses

// Special CORS configuration for uploads
app.use("/uploads", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow any origin to access images
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header(
    "Content-Security-Policy",
    "frame-ancestors 'self' http://localhost:5173"
  );
  next();
});

app.use(express.static("public"));
// Serve profile images
app.use(
  "/uploads/profiles",
  express.static(path.join(__dirname, "public/uploads/profiles"))
);

// Serve event images
app.use(
  "/uploads/events",
  express.static(path.join(__dirname, "public/uploads/events"))
);

// Serve NRIC images
app.use(
  "/api/uploads/nric",
  express.static(path.join(__dirname, "public/uploads/nric"))
);

app.use(
  "/api/uploads/organizer_docs",
  express.static(path.join(__dirname, "public/uploads/organizer_docs"))
);

app.use(
  "/certificates",
  express.static(path.join(__dirname, "public/certificates"))
);

// Session configuration - required for passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "volunsphere-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: "strict",
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session()); // Only needed if using sessions

// Create a health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    version: process.env.npm_package_version,
  });
});

// Mount all routes
app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

// Export the app
module.exports = app;
