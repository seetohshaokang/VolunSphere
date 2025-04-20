const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register/volunteer", authController.registerVolunteer);

router.post("/register/organiser", authController.registerOrganiser);

router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);

router.post("/logout", authController.logoutUser);

router.post("/reset-password", authController.requestPasswordReset);

router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;
