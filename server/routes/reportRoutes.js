const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { protectRoute } = require("../middleware/authMiddleware");

router.get("/", protectRoute, reportController.getUserReports);

router.post("/", protectRoute, reportController.createReport);

router.get("/:id", protectRoute, reportController.getReportById);

router.put("/:id", protectRoute, reportController.updateReport);

router.delete("/:id", protectRoute, reportController.deleteReport);

module.exports = router;
