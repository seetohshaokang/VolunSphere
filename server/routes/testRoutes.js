const express = require("express");
const { testConnection, testAuth } = require("../controllers/testController");
const { protectRoute } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/connection", testConnection);
router.get("/auth", protectRoute, testAuth);

module.exports = router;
