const SupplierService = require("../services/supplier.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getSuppliers = asyncHandler(async (req, res) => res.json(new ApiResponse(200, "Suppliers fetched successfully", await SupplierService.getSuppliers())));
const getActiveSuppliers = asyncHandler(async (req, res) => res.json(new ApiResponse(200, "Active suppliers fetched successfully", await SupplierService.getActiveSuppliers())));
const getSupplierById = asyncHandler(async (req, res) => res.json(new ApiResponse(200, "Supplier fetched successfully", await SupplierService.getSupplierById(req.params.supplierId))));
const createSupplier = asyncHandler(async (req, res) => { const result = await SupplierService.createSupplier(req.body, req.user.UserId); res.status(201).json(new ApiResponse(201, result.Message, { SupplierId: result.SupplierId })); });
const updateSupplier = asyncHandler(async (req, res) => { const result = await SupplierService.updateSupplier(req.params.supplierId, req.body, req.user.UserId); res.json(new ApiResponse(200, result.Message, null)); });
const deleteSupplier = asyncHandler(async (req, res) => { const result = await SupplierService.deleteSupplier(req.params.supplierId, req.user.UserId); res.json(new ApiResponse(200, result.Message, null)); });

module.exports = { getSuppliers, getActiveSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier };
