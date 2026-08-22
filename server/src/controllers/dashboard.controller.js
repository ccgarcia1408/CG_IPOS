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

module.exports = {
    getSalesSummary,
    getSalesTrend
};
