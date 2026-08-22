const pool = require("../config/db");

const InventoryModel = {
    async getAll(branchId) {
        const [rows] = await pool.query("CALL sp_inventories_getAll(?)", [branchId || null]);
        return rows[0] || [];
    },

    async getMovementHistory(branchId, productId) {
        const [rows] = await pool.query(
            "CALL sp_inventory_logs_getAll(?, ?)",
            [branchId || null, productId || null]
        );
        return rows[0] || [];
    },

    async receiveStock(branchId, productId, quantity, referenceType, referenceId, remarks, createdBy) {
        const [rows] = await pool.query(
            "CALL sp_inventory_receiveStock(?, ?, ?, ?, ?, ?, ?)",
            [branchId, productId, quantity, referenceType, referenceId ?? null, remarks ?? null, createdBy]
        );
        return rows[0][0];
    },

    async deductStock(branchId, productId, quantity, referenceType, referenceId, remarks, createdBy) {
        const [rows] = await pool.query(
            "CALL sp_inventory_deductStock(?, ?, ?, ?, ?, ?, ?)",
            [branchId, productId, quantity, referenceType, referenceId ?? null, remarks ?? null, createdBy]
        );
        return rows[0][0];
    },

    async adjustStock(branchId, productId, newQuantity, reason, createdBy) {
        const [rows] = await pool.query(
            "CALL sp_inventory_adjustStock(?, ?, ?, ?, ?)",
            [branchId, productId, newQuantity, reason, createdBy]
        );
        return rows[0][0];
    },

    async setMinimumStock(branchId, productId, minimumStock, updatedBy) {
        const [rows] = await pool.query(
            "CALL sp_inventories_setMinimumStock(?, ?, ?, ?)",
            [branchId, productId, minimumStock, updatedBy]
        );
        return rows[0][0];
    },
};

module.exports = InventoryModel;
