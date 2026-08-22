const pool = require("../config/db");

const PurchaseModel = {
    async getAll(branchId) {
        const [rows] = await pool.query("CALL sp_purchases_getAll(?)", [branchId || null]);
        return rows[0] || [];
    },

    async findById(purchaseId) {
        const [rows] = await pool.query("CALL sp_purchases_getById(?)", [purchaseId]);
        return rows[0][0] || null;
    },

    async getItems(purchaseId) {
        const [rows] = await pool.query("CALL sp_purchase_items_getByPurchaseId(?)", [purchaseId]);
        return rows[0] || [];
    },

    async create(branchId, supplierId, purchaseDate, createdBy) {
        const [rows] = await pool.query(
            "CALL sp_purchases_create(?, ?, ?, ?)",
            [branchId, supplierId, purchaseDate, createdBy]
        );
        return rows[0][0];
    },

    async addItem(purchaseId, productId, quantity, costPrice, createdBy) {
        const [rows] = await pool.query(
            "CALL sp_purchase_items_create(?, ?, ?, ?, ?)",
            [purchaseId, productId, quantity, costPrice, createdBy]
        );
        return rows[0][0];
    },

    async deleteItem(purchaseItemId, deletedBy) {
        const [rows] = await pool.query("CALL sp_purchase_items_delete(?, ?)", [purchaseItemId, deletedBy]);
        return rows[0][0];
    },

    async receive(purchaseId, receivedBy) {
        const [rows] = await pool.query("CALL sp_purchases_receive(?, ?)", [purchaseId, receivedBy]);
        return rows[0][0];
    },

    async cancel(purchaseId, reason, cancelledBy) {
        const [rows] = await pool.query("CALL sp_purchases_cancel(?, ?, ?)", [purchaseId, reason, cancelledBy]);
        return rows[0][0];
    },

    async delete(purchaseId, deletedBy) {
        const [rows] = await pool.query("CALL sp_purchases_delete(?, ?)", [purchaseId, deletedBy]);
        return rows[0][0];
    },
};

module.exports = PurchaseModel;
