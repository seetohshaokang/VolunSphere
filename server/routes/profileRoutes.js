const express = require("express");
const { protectRoute } = require("../middleware/authMiddleware");
const upload = require ("../middleware/multerMiddleware");
const router = express.Router();
const { fetchProfile, editProfile, deleteProfile } = require("../controllers/profileManagementController");

router.post("/updateProfile", protectRoute, upload, editProfile);
router.get("/readProfile", protectRoute, fetchProfile);
router.delete("/deleteProfile", protectRoute, deleteProfile);

module.exports = router;