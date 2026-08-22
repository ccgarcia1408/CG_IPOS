const DashboardService = require("../services/dashboard.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getSalesSummary = asyncHandler(async (req, res) => {
    const summary = await DashboardService.getSalesSummary(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Sales summary fetched successfully", summary));
});

const getSalesTrend = asyncHandler(async (req, res) => {
    const trend = await DashboardService.getSalesTrend(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Sales trend fetched successfully", trend));
});

const getSalesByPaymentMethod = asyncHandler(async (req, res) => {
    const data = await DashboardService.getSalesByPaymentMethod(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Sales by payment method fetched successfully", data));
});

const getSalesByBranch = asyncHandler(async (req, res) => {
    const data = await DashboardService.getSalesByBranch(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Sales by branch fetched successfully", data));
});

const getSalesByTerminal = asyncHandler(async (req, res) => {
    const data = await DashboardService.getSalesByTerminal(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Sales by terminal fetched successfully", data));
});

const getTopProducts = asyncHandler(async (req, res) => {
    const data = await DashboardService.getTopProducts(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Top products fetched successfully", data));
});

const getTopCategories = asyncHandler(async (req, res) => {
    const data = await DashboardService.getTopCategories(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Top categories fetched successfully", data));
});

const getInventorySummary = asyncHandler(async (req, res) => {
    const data = await DashboardService.getInventorySummary(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Inventory summary fetched successfully", data));
});

const getLowStockAlerts = asyncHandler(async (req, res) => {
    const data = await DashboardService.getLowStockAlerts(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Low stock alerts fetched successfully", data));
});

const getOutOfStockAlerts = asyncHandler(async (req, res) => {
    const data = await DashboardService.getOutOfStockAlerts(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Out of stock alerts fetched successfully", data));
});

const getExpiringProducts = asyncHandler(async (req, res) => {
    const data = await DashboardService.getExpiringProducts(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Expiring products fetched successfully", data));
});

const getPurchasingSummary = asyncHandler(async (req, res) => {
    const data = await DashboardService.getPurchasingSummary(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Purchasing summary fetched successfully", data));
});

const getPendingPurchases = asyncHandler(async (req, res) => {
    const data = await DashboardService.getPendingPurchases(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Pending purchases fetched successfully", data));
});

const getSupplierSummary = asyncHandler(async (req, res) => {
    const data = await DashboardService.getSupplierSummary(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Supplier summary fetched successfully", data));
});

const getCashierPerformance = asyncHandler(async (req, res) => {
    const data = await DashboardService.getCashierPerformance(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Cashier performance fetched successfully", data));
});

const getVoidedSales = asyncHandler(async (req, res) => {
    const data = await DashboardService.getVoidedSales(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Voided sales fetched successfully", data));
});

const getStockAdjustmentSummary = asyncHandler(async (req, res) => {
    const data = await DashboardService.getStockAdjustmentSummary(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Stock adjustment summary fetched successfully", data));
});

const getRecentStockAdjustments = asyncHandler(async (req, res) => {
    const data = await DashboardService.getRecentStockAdjustments(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Recent stock adjustments fetched successfully", data));
});

const getOfficialReceiptSummary = asyncHandler(async (req, res) => {
    const data = await DashboardService.getOfficialReceiptSummary(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Official receipt summary fetched successfully", data));
});

const getOrAssignmentStatus = asyncHandler(async (req, res) => {
    const data = await DashboardService.getOrAssignmentStatus();

    res.status(200).json(new ApiResponse(200, "OR assignment status fetched successfully", data));
});

const getReturnReasons = asyncHandler(async (req, res) => {
    const data = await DashboardService.getReturnReasons(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Return reasons fetched successfully", data));
});

const getTopReturnedProducts = asyncHandler(async (req, res) => {
    const data = await DashboardService.getTopReturnedProducts(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Top returned products fetched successfully", data));
});

const getRecentSales = asyncHandler(async (req, res) => {
    const data = await DashboardService.getRecentSales(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Recent sales fetched successfully", data));
});

const getRecentPurchases = asyncHandler(async (req, res) => {
    const data = await DashboardService.getRecentPurchases(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Recent purchases fetched successfully", data));
});

const getRecentActivity = asyncHandler(async (req, res) => {
    const data = await DashboardService.getRecentActivity(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Recent activity fetched successfully", data));
});

const getActiveShifts = asyncHandler(async (req, res) => {
    const data = await DashboardService.getActiveShifts(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Active shifts fetched successfully", data));
});

const getShiftClosingSummary = asyncHandler(async (req, res) => {
    const data = await DashboardService.getShiftClosingSummary(req.query, req.scope);

    res.status(200).json(new ApiResponse(200, "Shift closing summary fetched successfully", data));
});

module.exports = {
    getSalesSummary,
    getSalesTrend,
    getSalesByPaymentMethod,
    getSalesByBranch,
    getSalesByTerminal,
    getTopProducts,
    getTopCategories,
    getInventorySummary,
    getLowStockAlerts,
    getOutOfStockAlerts,
    getExpiringProducts,
    getPurchasingSummary,
    getPendingPurchases,
    getSupplierSummary,
    getCashierPerformance,
    getVoidedSales,
    getStockAdjustmentSummary,
    getRecentStockAdjustments,
    getOfficialReceiptSummary,
    getOrAssignmentStatus,
    getReturnReasons,
    getTopReturnedProducts,
    getRecentSales,
    getRecentPurchases,
    getRecentActivity,
    getActiveShifts,
    getShiftClosingSummary
};
