// server/routes/certificateRoutes.js
const express = require("express");
const router = express.Router();
const certificateController = require("../controllers/certificateController");
const { protectRoute, requireRole } = require("../middleware/authMiddleware");

router.post(
  "/generate/:eventId",
  protectRoute,
  requireRole("volunteer"),
  certificateController.generateCertificate
);

router.get(
  "/download/:certificateId",
  certificateController.downloadCertificate
);

router.get("/verify/:certificateId", certificateController.verifyCertificate);

router.get(
  "/volunteer",
  protectRoute,
  requireRole("volunteer"),
  certificateController.getVolunteerCertificates
);

module.exports = router;
