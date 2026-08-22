const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const branchAccessMiddleware = require("../middlewares/branchAccess.middleware");

router.get("/sales-summary", authMiddleware, branchAccessMiddleware, dashboardController.getSalesSummary);
router.get("/sales-trend", authMiddleware, branchAccessMiddleware, dashboardController.getSalesTrend);

module.exports = router;
