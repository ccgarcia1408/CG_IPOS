const SaleService = require("../services/sale.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getSales = asyncHandler(async (req, res) => {
    const sales = await SaleService.getSales(req.query.BranchId, req.query.TerminalId);
    res.status(200).json(new ApiResponse(200, "Sales fetched successfully", sales));
});

const getSaleById = asyncHandler(async (req, res) => {
    const sale = await SaleService.getSaleById(req.params.saleId);
    res.status(200).json(new ApiResponse(200, "Sale fetched successfully", sale));
});

const completeSale = asyncHandler(async (req, res) => {
    const sale = await SaleService.completeSale(req.body, req.user.UserId, req.user.UserId);
    res.status(201).json(new ApiResponse(201, "Sale completed successfully", sale));
});

const voidSale = asyncHandler(async (req, res) => {
    const result = await SaleService.voidSale(req.params.saleId, req.body.Reason, req.user.UserId);
    res.status(200).json(new ApiResponse(200, result.Message, null));
});

const returnItem = asyncHandler(async (req, res) => {
    const result = await SaleService.returnItem(req.params.saleItemId, req.body, req.user.UserId);
    res.status(201).json(new ApiResponse(201, result.Message, result));
});

module.exports = { getSales, getSaleById, completeSale, voidSale, returnItem };
