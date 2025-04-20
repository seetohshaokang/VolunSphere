// scripts/seedAdmin.js
require("dotenv").config({ path: "./.env.server" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Admin = require("../models/Admin");

// MongoDB connection URI
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/volunsphere";

async function seedAdmin() {
  try {
    console.log(" Seeding admin account...");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(" Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: "admin@volunsphere.com",
    });

    if (existingAdmin) {
      console.log("⚠️ Admin account already exists. No action taken.");
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("adminpassword", salt);

      // Create admin user
      const adminUser = new User({
        email: "admin@volunsphere.com",
        password: hashedPassword,
        role: "admin",
        status: "active",
        created_at: new Date(),
        last_login: new Date(),
      });

      const savedAdminUser = await adminUser.save();
      console.log(` Created admin user: ${savedAdminUser.email}`);

      // Create admin profile with all permissions
      const admin = new Admin({
        user_id: savedAdminUser._id,
        name: "System Administrator",
        phone: "88888888",
        profile_picture_url: null,
        role: "supervisor", // Give the highest level of admin privileges
        permissions: [
          "manage_users",
          "manage_events",
          "manage_reports",
          "manage_admins",
          "system_settings",
        ],
        last_login: new Date(),
        reports_handled: 0,
      });

      await admin.save();
      console.log(` Created admin profile for: ${savedAdminUser.email}`);

      console.log("\nAdmin Account Information:");
      console.log("Email: admin@volunsphere.com");
      console.log("Password: adminpassword");
    }

    // Close MongoDB connection
    await mongoose.connection.close();
    console.log(" MongoDB connection closed");
  } catch (error) {
    console.error(" Seeding admin failed:", error);
    // Ensure mongoose connection is closed even if there's an error
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log(" MongoDB connection closed");
    }
    process.exit(1);
  }
}

seedAdmin();
