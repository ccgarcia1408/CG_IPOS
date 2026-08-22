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
    getExpiringProducts
};
