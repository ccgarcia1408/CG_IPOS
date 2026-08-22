const pool = require("../config/db");

const CashierShiftModel = {
    async open(cashierId, branchId, terminalId, openingCash, createdBy) {
        const [rows] = await pool.query(
            `CALL sp_cashier_shifts_open(?, ?, ?, ?, ?)`,
            [cashierId, branchId, terminalId, openingCash, createdBy]
        );

        return rows[0][0];
    },

    async close(cashierShiftId, closingCashierId, closingCash, updatedBy) {
        const [rows] = await pool.query(
            `CALL sp_cashier_shifts_close(?, ?, ?, ?)`,
            [cashierShiftId, closingCashierId, closingCash, updatedBy]
        );

        return rows[0][0];
    },

    async getMyOpenShift(cashierId) {
        const [rows] = await pool.query(`CALL sp_cashier_shifts_getMyOpenShift(?)`, [cashierId]);
        return rows[0][0] || null;
    }
};

module.exports = CashierShiftModel;
