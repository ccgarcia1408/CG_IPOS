import type { RowDataPacket } from "mysql2";
import type { SqlParam } from "../types/db";
import pool from "../config/db";

const PurchaseModel = {
    async getAll(branchId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>("CALL sp_purchases_getAll(?)", [branchId || null]);
        return rows[0] || [];
    },

    async findById(purchaseId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>("CALL sp_purchases_getById(?)", [purchaseId]);
        return rows[0][0] || null;
    },

    async getItems(purchaseId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>("CALL sp_purchase_items_getByPurchaseId(?)", [purchaseId]);
        return rows[0] || [];
    },

    async create(branchId: SqlParam, supplierId: SqlParam, purchaseDate: SqlParam, createdBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            "CALL sp_purchases_create(?, ?, ?, ?)",
            [branchId, supplierId, purchaseDate, createdBy]
        );
        return rows[0][0];
    },

    async addItem(purchaseId: SqlParam, productId: SqlParam, quantity: SqlParam, costPrice: SqlParam, createdBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            "CALL sp_purchase_items_create(?, ?, ?, ?, ?)",
            [purchaseId, productId, quantity, costPrice, createdBy]
        );
        return rows[0][0];
    },

    async deleteItem(purchaseItemId: SqlParam, deletedBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>("CALL sp_purchase_items_delete(?, ?)", [purchaseItemId, deletedBy]);
        return rows[0][0];
    },

    async receive(purchaseId: SqlParam, receivedBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>("CALL sp_purchases_receive(?, ?)", [purchaseId, receivedBy]);
        return rows[0][0];
    },

    async cancel(purchaseId: SqlParam, reason: SqlParam, cancelledBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>("CALL sp_purchases_cancel(?, ?, ?)", [purchaseId, reason, cancelledBy]);
        return rows[0][0];
    },

    async delete(purchaseId: SqlParam, deletedBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>("CALL sp_purchases_delete(?, ?)", [purchaseId, deletedBy]);
        return rows[0][0];
    },
};

export default PurchaseModel;
