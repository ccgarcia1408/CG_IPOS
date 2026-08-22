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
router.get("/purchasing-summary", authMiddleware, branchAccessMiddleware, dashboardController.getPurchasingSummary);
router.get("/pending-purchases", authMiddleware, branchAccessMiddleware, dashboardController.getPendingPurchases);
router.get("/supplier-summary", authMiddleware, branchAccessMiddleware, dashboardController.getSupplierSummary);
router.get("/cashier-performance", authMiddleware, branchAccessMiddleware, dashboardController.getCashierPerformance);
router.get("/voided-sales", authMiddleware, branchAccessMiddleware, dashboardController.getVoidedSales);
router.get("/stock-adjustment-summary", authMiddleware, branchAccessMiddleware, dashboardController.getStockAdjustmentSummary);
router.get("/recent-stock-adjustments", authMiddleware, branchAccessMiddleware, dashboardController.getRecentStockAdjustments);

module.exports = router;
