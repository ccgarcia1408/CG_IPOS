const InventoryService = require("../services/inventory.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getInventory = asyncHandler(async (req, res) => {
    const inventory = await InventoryService.getInventory(req.query.BranchId);
    res.status(200).json(new ApiResponse(200, "Inventory fetched successfully", inventory));
});

const getMovementHistory = asyncHandler(async (req, res) => {
    const history = await InventoryService.getMovementHistory(req.query.BranchId, req.query.ProductId);
    res.status(200).json(new ApiResponse(200, "Inventory movement history fetched successfully", history));
});

const receiveStock = asyncHandler(async (req, res) => {
    const result = await InventoryService.receiveStock(req.body, req.user.UserId);
    res.status(201).json(new ApiResponse(201, result.Message, { InventoryLogId: result.InventoryLogId, StockAfter: result.StockAfter }));
});

const adjustStock = asyncHandler(async (req, res) => {
    const result = await InventoryService.adjustStock(req.body, req.user.UserId);
    res.status(200).json(new ApiResponse(200, result.Message, { InventoryLogId: result.InventoryLogId, StockAfter: result.StockAfter }));
});

const setMinimumStock = asyncHandler(async (req, res) => {
    const result = await InventoryService.setMinimumStock(req.body, req.user.UserId);
    res.status(200).json(new ApiResponse(200, result.Message, null));
});

module.exports = { getInventory, getMovementHistory, receiveStock, adjustStock, setMinimumStock };
