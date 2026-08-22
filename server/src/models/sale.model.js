const pool = require("../config/db");

const SaleModel = {
    async getAll(branchId, terminalId) {
        const [rows] = await pool.query("CALL sp_sales_getAll(?, ?)", [branchId || null, terminalId || null]);
        return rows[0] || [];
    },

    async findById(saleId) {
        const [rows] = await pool.query("CALL sp_sales_getById(?)", [saleId]);
        return rows[0][0] || null;
    },

    async getItems(saleId) {
        const [rows] = await pool.query("CALL sp_sale_items_getBySaleId(?)", [saleId]);
        return rows[0] || [];
    },

    async getReturns(saleId) {
        const [rows] = await pool.query("CALL sp_sale_returns_getBySaleId(?)", [saleId]);
        return rows[0] || [];
    },

    async completeSale(branchId, terminalId, cashierId, paymentMethodId, discountId, taxId, amountPaid, itemsJson, createdBy) {
        const [rows] = await pool.query(
            "CALL sp_sales_completeSale(?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [branchId, terminalId, cashierId, paymentMethodId, discountId, taxId, amountPaid, itemsJson, createdBy]
        );
        return rows[0][0];
    },

    async void(saleId, reason, voidedBy) {
        const [rows] = await pool.query("CALL sp_sales_void(?, ?, ?)", [saleId, reason, voidedBy]);
        return rows[0][0];
    },

    async returnItem(saleItemId, quantityReturned, reason, processedBy) {
        const [rows] = await pool.query(
            "CALL sp_sales_return(?, ?, ?, ?)",
            [saleItemId, quantityReturned, reason, processedBy]
        );
        return rows[0][0];
    },
};

module.exports = SaleModel;
