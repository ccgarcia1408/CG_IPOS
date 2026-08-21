const PurchaseService = require("../services/purchase.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getPurchases = asyncHandler(async (req, res) => {
    const purchases = await PurchaseService.getPurchases(req.query.BranchId);
    res.status(200).json(new ApiResponse(200, "Purchase orders fetched successfully", purchases));
});

const getPurchaseById = asyncHandler(async (req, res) => {
    const purchase = await PurchaseService.getPurchaseById(req.params.purchaseId);
    res.status(200).json(new ApiResponse(200, "Purchase order fetched successfully", purchase));
});

const createPurchase = asyncHandler(async (req, res) => {
    const purchase = await PurchaseService.createPurchase(req.body, req.user.UserId);
    res.status(201).json(new ApiResponse(201, "Purchase order created successfully", purchase));
});

const addItem = asyncHandler(async (req, res) => {
    const result = await PurchaseService.addItem(req.params.purchaseId, req.body, req.user.UserId);
    res.status(201).json(new ApiResponse(201, result.Message, result));
});

const deleteItem = asyncHandler(async (req, res) => {
    const result = await PurchaseService.deleteItem(req.params.purchaseItemId, req.user.UserId);
    res.status(200).json(new ApiResponse(200, result.Message, null));
});

const receivePurchase = asyncHandler(async (req, res) => {
    const result = await PurchaseService.receivePurchase(req.params.purchaseId, req.user.UserId);
    res.status(200).json(new ApiResponse(200, result.Message, null));
});

const cancelPurchase = asyncHandler(async (req, res) => {
    const result = await PurchaseService.cancelPurchase(req.params.purchaseId, req.body.Reason, req.user.UserId);
    res.status(200).json(new ApiResponse(200, result.Message, null));
});

const deletePurchase = asyncHandler(async (req, res) => {
    const result = await PurchaseService.deletePurchase(req.params.purchaseId, req.user.UserId);
    res.status(200).json(new ApiResponse(200, result.Message, null));
});

module.exports = {
    getPurchases,
    getPurchaseById,
    createPurchase,
    addItem,
    deleteItem,
    receivePurchase,
    cancelPurchase,
    deletePurchase,
};
