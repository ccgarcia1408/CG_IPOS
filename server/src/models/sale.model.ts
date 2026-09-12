import type { RowDataPacket } from "mysql2";
import type { SqlParam } from "../types/db";
import pool from "../config/db";

const SaleModel = {
    async getAll(branchId: SqlParam, terminalId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>("CALL sp_sales_getAll(?, ?)", [branchId || null, terminalId || null]);
        return rows[0] || [];
    },

    async findById(saleId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>("CALL sp_sales_getById(?)", [saleId]);
        return rows[0][0] || null;
    },

    async getItems(saleId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>("CALL sp_sale_items_getBySaleId(?)", [saleId]);
        return rows[0] || [];
    },

    async getReturns(saleId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>("CALL sp_sale_returns_getBySaleId(?)", [saleId]);
        return rows[0] || [];
    },

    async completeSale(branchId: SqlParam, terminalId: SqlParam, cashierId: SqlParam, paymentMethodId: SqlParam, discountId: SqlParam, taxId: SqlParam, amountPaid: SqlParam, itemsJson: SqlParam, createdBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            "CALL sp_sales_completeSale(?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [branchId, terminalId, cashierId, paymentMethodId, discountId, taxId, amountPaid, itemsJson, createdBy]
        );
        return rows[0][0];
    },

    async void(saleId: SqlParam, reason: SqlParam, voidedBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>("CALL sp_sales_void(?, ?, ?)", [saleId, reason, voidedBy]);
        return rows[0][0];
    },

    async returnItem(saleItemId: SqlParam, quantityReturned: SqlParam, reason: SqlParam, processedBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            "CALL sp_sales_return(?, ?, ?, ?)",
            [saleItemId, quantityReturned, reason, processedBy]
        );
        return rows[0][0];
    },
};

export default SaleModel;
