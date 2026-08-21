const InventoryModel = require("../models/inventory.model");
const ApiError = require("../utils/ApiError");

const positiveInteger = (value, label) => {
    const number = Number(value);
    if (!Number.isInteger(number) || number <= 0) {
        throw new ApiError(400, `${label} must be a positive whole number.`);
    }
    return number;
};

const nonNegativeInteger = (value, label) => {
    const number = Number(value);
    if (!Number.isInteger(number) || number < 0) {
        throw new ApiError(400, `${label} must be a non-negative whole number.`);
    }
    return number;
};

const optionalPositiveInteger = (value, label) => {
    if (value === undefined || value === null || value === "") return null;
    return positiveInteger(value, label);
};

// Reference types recorded on a movement so history stays meaningful; SALE/SALE_VOID/SALE_RETURN
// are reserved for the POS module (Phase 5) and PURCHASE for Purchasing (Phase 4) — this
// service only exposes the manual, admin-driven reasons for now.
const MANUAL_RECEIVE_REFERENCE_TYPES = new Set(["OPENING_BALANCE", "MANUAL_RECEIVE", "STOCK_TRANSFER_IN"]);

const InventoryService = {
    async getInventory(branchId) {
        if (branchId !== undefined && branchId !== null && branchId !== "") {
            return InventoryModel.getAll(positiveInteger(branchId, "BranchId"));
        }
        return InventoryModel.getAll(null);
    },

    async getMovementHistory(branchId, productId) {
        const normalizedBranchId = branchId ? positiveInteger(branchId, "BranchId") : null;
        const normalizedProductId = productId ? positiveInteger(productId, "ProductId") : null;
        return InventoryModel.getMovementHistory(normalizedBranchId, normalizedProductId);
    },

    async receiveStock(data, createdBy) {
        const branchId = positiveInteger(data.BranchId, "BranchId");
        const productId = positiveInteger(data.ProductId, "ProductId");
        const quantity = positiveInteger(data.Quantity, "Quantity");
        const referenceType = MANUAL_RECEIVE_REFERENCE_TYPES.has(data.ReferenceType)
            ? data.ReferenceType
            : "MANUAL_RECEIVE";
        const referenceId = optionalPositiveInteger(data.ReferenceId, "ReferenceId");
        const remarks = data.Remarks ? String(data.Remarks).trim().slice(0, 255) || null : null;

        const result = await InventoryModel.receiveStock(
            branchId, productId, quantity, referenceType, referenceId, remarks, createdBy
        );

        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },

    async adjustStock(data, createdBy) {
        const branchId = positiveInteger(data.BranchId, "BranchId");
        const productId = positiveInteger(data.ProductId, "ProductId");
        const newQuantity = nonNegativeInteger(data.NewQuantity, "NewQuantity");
        const reason = String(data.Reason || "").trim();

        if (!reason) throw new ApiError(400, "A reason is required for a manual stock adjustment.");

        const result = await InventoryModel.adjustStock(
            branchId, productId, newQuantity, reason.slice(0, 255), createdBy
        );

        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },

    async setMinimumStock(data, updatedBy) {
        const branchId = positiveInteger(data.BranchId, "BranchId");
        const productId = positiveInteger(data.ProductId, "ProductId");
        const minimumStock = nonNegativeInteger(data.MinimumStock, "MinimumStock");

        const result = await InventoryModel.setMinimumStock(branchId, productId, minimumStock, updatedBy);

        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },
};

module.exports = InventoryService;
