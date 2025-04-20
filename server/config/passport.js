const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const bcrypt = require("bcryptjs");
const User = require("../models/User");

if (!process.env.JWT_SECRET) {
  console.error("ERROR: JWT_SECRET is not defined in environment variables!");
  console.error("Please ensure your .env file contains a JWT_SECRET value.");
}

passport.use(
  new LocalStrategy(
    {
      usernameField: "email", // Use email as the username field
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        // Find user by email
        const user = await User.findOne({ email });

        // No user found with that email
        if (!user) {
          return done(null, false, {
            message: "Invalid credentials",
          });
        }

        // Check if user is active
        if (user.status !== "active") {
          return done(null, false, {
            message: "Account is not active or has been suspended",
          });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, {
            message: "Invalid credentials",
          });
        }

        // Update last login time
        user.last_login = new Date();
        await user.save();

        // Authentication successful
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// JWT Strategy (for token authentication)
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || "fallback_secret_for_development_only",
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      console.log("JWT Payload:", jwtPayload);

      const userId = jwtPayload.user ? jwtPayload.user.id : jwtPayload.id;
      console.log("Looking for user with ID:", userId);

      // Find user by ID from JWT payload
      const user = await User.findById(userId);
      console.log("User lookup result:", user ? "Found" : "Not found");

      // No user found with that ID
      if (!user) {
        return done(null, false, { message: "User not found" });
      }

      // Check if user is active
      if (user.status !== "active") {
        return done(null, false, {
          message: "User account not active",
        });
      }

      // Authentication successful
      return done(null, user);
    } catch (err) {
      console.error("JWT Strategy error:", err);
      return done(err, false);
    }
  })
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
