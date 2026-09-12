import type { RowDataPacket } from "mysql2";
import type { SqlParam } from "../types/db";
import pool from "../config/db";

const CashierShiftModel = {
    async open(cashierId: SqlParam, branchId: SqlParam, terminalId: SqlParam, openingCash: SqlParam, createdBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_cashier_shifts_open(?, ?, ?, ?, ?)`,
            [cashierId, branchId, terminalId, openingCash, createdBy]
        );

        return rows[0][0];
    },

    async close(cashierShiftId: SqlParam, closingCashierId: SqlParam, closingCash: SqlParam, updatedBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_cashier_shifts_close(?, ?, ?, ?)`,
            [cashierShiftId, closingCashierId, closingCash, updatedBy]
        );

        return rows[0][0];
    },

    async getMyOpenShift(cashierId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_cashier_shifts_getMyOpenShift(?)`, [cashierId]);
        return rows[0][0] || null;
    }
};

export default CashierShiftModel;
