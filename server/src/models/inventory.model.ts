import type { RowDataPacket } from "mysql2";
import type { SqlParam } from "../types/db";
import pool from "../config/db";

const InventoryModel = {
    async getAll(branchId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>("CALL sp_inventories_getAll(?)", [branchId || null]);
        return rows[0] || [];
    },

    async getMovementHistory(branchId: SqlParam, productId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            "CALL sp_inventory_logs_getAll(?, ?)",
            [branchId || null, productId || null]
        );
        return rows[0] || [];
    },

    async receiveStock(branchId: SqlParam, productId: SqlParam, quantity: SqlParam, referenceType: SqlParam, referenceId: SqlParam, remarks: SqlParam, createdBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            "CALL sp_inventory_receiveStock(?, ?, ?, ?, ?, ?, ?)",
            [branchId, productId, quantity, referenceType, referenceId ?? null, remarks ?? null, createdBy]
        );
        return rows[0][0];
    },

    async deductStock(branchId: SqlParam, productId: SqlParam, quantity: SqlParam, referenceType: SqlParam, referenceId: SqlParam, remarks: SqlParam, createdBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            "CALL sp_inventory_deductStock(?, ?, ?, ?, ?, ?, ?)",
            [branchId, productId, quantity, referenceType, referenceId ?? null, remarks ?? null, createdBy]
        );
        return rows[0][0];
    },

    async adjustStock(branchId: SqlParam, productId: SqlParam, newQuantity: SqlParam, reason: SqlParam, createdBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            "CALL sp_inventory_adjustStock(?, ?, ?, ?, ?)",
            [branchId, productId, newQuantity, reason, createdBy]
        );
        return rows[0][0];
    },

    async setMinimumStock(branchId: SqlParam, productId: SqlParam, minimumStock: SqlParam, updatedBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            "CALL sp_inventories_setMinimumStock(?, ?, ?, ?)",
            [branchId, productId, minimumStock, updatedBy]
        );
        return rows[0][0];
    },
};

export default InventoryModel;
