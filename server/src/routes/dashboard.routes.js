const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const branchAccessMiddleware = require("../middlewares/branchAccess.middleware");

router.get("/sales-summary", authMiddleware, branchAccessMiddleware, dashboardController.getSalesSummary);
router.get("/sales-trend", authMiddleware, branchAccessMiddleware, dashboardController.getSalesTrend);
router.get("/sales-by-payment-method", authMiddleware, branchAccessMiddleware, dashboardController.getSalesByPaymentMethod);
router.get("/sales-by-branch", authMiddleware, branchAccessMiddleware, dashboardController.getSalesByBranch);
router.get("/sales-by-terminal", authMiddleware, branchAccessMiddleware, dashboardController.getSalesByTerminal);
router.get("/top-products", authMiddleware, branchAccessMiddleware, dashboardController.getTopProducts);
router.get("/top-categories", authMiddleware, branchAccessMiddleware, dashboardController.getTopCategories);
router.get("/inventory-summary", authMiddleware, branchAccessMiddleware, dashboardController.getInventorySummary);
router.get("/low-stock-alerts", authMiddleware, branchAccessMiddleware, dashboardController.getLowStockAlerts);
router.get("/out-of-stock-alerts", authMiddleware, branchAccessMiddleware, dashboardController.getOutOfStockAlerts);
router.get("/expiring-products", authMiddleware, branchAccessMiddleware, dashboardController.getExpiringProducts);

module.exports = router;
