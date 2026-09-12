import PurchaseModel from "../models/purchase.model";
import ApiError from "../utils/ApiError";

const positiveInteger = (value: any, label: any) => {
    const number = Number(value);
    if (!Number.isInteger(number) || number <= 0) {
        throw new ApiError(400, `${label} must be a positive whole number.`);
    }
    return number;
};

const nonNegativeNumber = (value: any, label: any) => {
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0) {
        throw new ApiError(400, `${label} must be a non-negative number.`);
    }
    return number;
};

const todayDateString = () => new Date().toISOString().slice(0, 10);

const purchaseDate = (value: any) => {
    if (value === null || value === undefined || value === "") return todayDateString();

    const stringValue = String(value).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(stringValue) || Number.isNaN(new Date(`${stringValue}T00:00:00Z`).getTime())) {
        throw new ApiError(400, "PurchaseDate must be a valid date.");
    }
    return stringValue;
};

const PurchaseService = {
    async getPurchases(branchId: any) {
        return PurchaseModel.getAll(branchId ? positiveInteger(branchId, "BranchId") : null);
    },

    async getPurchaseById(purchaseId: any) {
        const purchase = await PurchaseModel.findById(positiveInteger(purchaseId, "PurchaseId"));
        if (!purchase) throw new ApiError(404, "Purchase order not found");

        const items = await PurchaseModel.getItems(purchase.PurchaseId);
        return { ...purchase, Items: items };
    },

    // Creates the header, then adds each line item in sequence. Each addItem call is its own
    // atomic operation (see sp_purchase_items_create) but the two aren't wrapped in one giant
    // transaction across the whole order — if item N fails, the header and items 1..N-1 already
    // exist as a valid pending order the caller can fix (add the missing item, or delete the
    // order outright). That's a low-severity failure mode; nothing has touched inventory yet.
    async createPurchase(data: any, createdBy: any) {
        const branchId = positiveInteger(data.BranchId, "BranchId");
        const supplierId = positiveInteger(data.SupplierId, "SupplierId");
        const items = Array.isArray(data.Items) ? data.Items : [];

        if (!items.length) throw new ApiError(400, "At least one line item is required.");

        const header = await PurchaseModel.create(branchId, supplierId, purchaseDate(data.PurchaseDate), createdBy);
        if (!header.Success) throw new ApiError(400, header.Message);

        const purchaseId = header.PurchaseId;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const productId = positiveInteger(item.ProductId, `Item ${i + 1} ProductId`);
            const quantity = positiveInteger(item.Quantity, `Item ${i + 1} Quantity`);
            const costPrice = nonNegativeNumber(item.CostPrice, `Item ${i + 1} CostPrice`);

            const result = await PurchaseModel.addItem(purchaseId, productId, quantity, costPrice, createdBy);
            if (!result.Success) {
                throw new ApiError(
                    400,
                    `Purchase order #${purchaseId} was created, but item ${i + 1} failed: ${result.Message} You can edit or delete the order.`
                );
            }
        }

        return this.getPurchaseById(purchaseId);
    },

    async addItem(purchaseId: any, data: any, createdBy: any) {
        const productId = positiveInteger(data.ProductId, "ProductId");
        const quantity = positiveInteger(data.Quantity, "Quantity");
        const costPrice = nonNegativeNumber(data.CostPrice, "CostPrice");

        const result = await PurchaseModel.addItem(
            positiveInteger(purchaseId, "PurchaseId"), productId, quantity, costPrice, createdBy
        );
        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },

    async deleteItem(purchaseItemId: any, deletedBy: any) {
        const result = await PurchaseModel.deleteItem(positiveInteger(purchaseItemId, "PurchaseItemId"), deletedBy);
        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },

    async receivePurchase(purchaseId: any, receivedBy: any) {
        const result = await PurchaseModel.receive(positiveInteger(purchaseId, "PurchaseId"), receivedBy);
        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },

    async cancelPurchase(purchaseId: any, reason: any, cancelledBy: any) {
        const trimmedReason = String(reason || "").trim();
        if (!trimmedReason) throw new ApiError(400, "A reason is required to cancel a purchase order.");

        const result = await PurchaseModel.cancel(positiveInteger(purchaseId, "PurchaseId"), trimmedReason, cancelledBy);
        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },

    async deletePurchase(purchaseId: any, deletedBy: any) {
        const result = await PurchaseModel.delete(positiveInteger(purchaseId, "PurchaseId"), deletedBy);
        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },
};

export default PurchaseService;
