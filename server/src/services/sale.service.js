const SaleModel = require("../models/sale.model");
const ApiError = require("../utils/ApiError");

const positiveInteger = (value, label) => {
    const number = Number(value);
    if (!Number.isInteger(number) || number <= 0) {
        throw new ApiError(400, `${label} must be a positive whole number.`);
    }
    return number;
};

const nonNegativeNumber = (value, label, fallback = 0) => {
    if (value === undefined || value === null || value === "") return fallback;
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0) {
        throw new ApiError(400, `${label} must be a non-negative number.`);
    }
    return number;
};

const optionalPositiveInteger = (value, label) => {
    if (value === undefined || value === null || value === "") return null;
    return positiveInteger(value, label);
};

const SaleService = {
    async getSales(branchId, terminalId) {
        return SaleModel.getAll(
            branchId ? positiveInteger(branchId, "BranchId") : null,
            terminalId ? positiveInteger(terminalId, "TerminalId") : null
        );
    },

    async getSaleById(saleId) {
        const sale = await SaleModel.findById(positiveInteger(saleId, "SaleId"));
        if (!sale) throw new ApiError(404, "Sale not found");

        const [items, returns] = await Promise.all([
            SaleModel.getItems(sale.SaleId),
            SaleModel.getReturns(sale.SaleId),
        ]);

        return { ...sale, Items: items, Returns: returns };
    },

    // cashierId is always the authenticated caller (req.user.UserId) — never accepted from the
    // request body, so one cashier can never complete a sale "as" another.
    async completeSale(data, cashierId, createdBy) {
        const branchId = positiveInteger(data.BranchId, "BranchId");
        const terminalId = positiveInteger(data.TerminalId, "TerminalId");
        const paymentMethodId = positiveInteger(data.PaymentMethodId, "PaymentMethodId");
        const discountId = optionalPositiveInteger(data.DiscountId, "DiscountId");
        const taxId = optionalPositiveInteger(data.TaxId, "TaxId");
        const amountPaid = nonNegativeNumber(data.AmountPaid, "AmountPaid");

        const items = Array.isArray(data.Items) ? data.Items : [];
        if (!items.length) throw new ApiError(400, "At least one line item is required.");

        const normalizedItems = items.map((item, index) => ({
            ProductId: positiveInteger(item.ProductId, `Item ${index + 1} ProductId`),
            Quantity: positiveInteger(item.Quantity, `Item ${index + 1} Quantity`),
            Discount: nonNegativeNumber(item.Discount, `Item ${index + 1} Discount`),
        }));

        const result = await SaleModel.completeSale(
            branchId, terminalId, cashierId, paymentMethodId, discountId, taxId, amountPaid,
            JSON.stringify(normalizedItems), createdBy
        );

        if (!result.Success) throw new ApiError(400, result.Message);
        return this.getSaleById(result.SaleId);
    },

    async voidSale(saleId, reason, voidedBy) {
        const trimmedReason = String(reason || "").trim();
        if (!trimmedReason) throw new ApiError(400, "A reason is required to void a sale.");

        const result = await SaleModel.void(positiveInteger(saleId, "SaleId"), trimmedReason, voidedBy);
        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },

    async returnItem(saleItemId, data, processedBy) {
        const quantityReturned = positiveInteger(data.QuantityReturned, "QuantityReturned");
        const reason = String(data.Reason || "").trim();
        if (!reason) throw new ApiError(400, "A reason is required for a return.");

        const result = await SaleModel.returnItem(
            positiveInteger(saleItemId, "SaleItemId"), quantityReturned, reason, processedBy
        );
        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },
};

module.exports = SaleService;
