const express = require("express");
const router = express.Router();
const registrationController = require("../controllers/registrationController");
const { protectRoute, requireRole } = require("../middleware/authMiddleware");

router.get("/", protectRoute, registrationController.getUserRegistrations);
router.post(
  "/",
  protectRoute,
  requireRole("volunteer"),
  registrationController.createRegistration
);

router.get("/:id", protectRoute, registrationController.getRegistrationById);

router.put("/:id", protectRoute, registrationController.updateRegistration);

router.delete("/:id", protectRoute, registrationController.cancelRegistration);

router.post(
  "/:id/check-in",
  protectRoute,
  requireRole("organiser"),
  registrationController.checkInRegistration
);

router.post(
  "/:id/check-out",
  protectRoute,
  requireRole("organiser"),
  registrationController.checkOutRegistration
);

router.post("/:id/feedback", protectRoute, registrationController.addFeedback);

module.exports = router;
