const pool = require("../config/db");

const TerminalModel = {
    async getAll() {
        const [rows] = await pool.query(`CALL sp_terminals_getAll()`);
        return rows[0] || [];
    },
    
    async getAllActive() {
        const [rows] = await pool.query(`CALL sp_terminals_getAllActive()`);
        return rows[0] || [];
    },

    async findById(terminalId) {
        const [rows] = await pool.query(`CALL sp_terminals_getById(?)`, [terminalId]);
        return rows[0][0] || null;
    },
    async create(branchId, name, description, userId) {
        const [rows] = await pool.query(
            `CALL sp_terminals_create(?, ?, ?, ?)`,
            [branchId, name, description, userId]
        );

        return rows[0][0];
    },

    async update(terminalId, branchId, name, description, userId, isActive) {
        const [rows] = await pool.query(
            `CALL sp_terminals_update(?, ?, ?, ?, ?, ?)`,
            [terminalId, branchId, name, description, userId, isActive]
        );

        return rows[0][0];
    },

    async delete(terminalId, userId) {
        const [rows] = await pool.query(
            `CALL sp_terminals_delete(?, ?)`,
            [terminalId, userId]
        );

        return rows[0][0];
    },

};

module.exports = TerminalModel;
