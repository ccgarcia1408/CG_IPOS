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

};

module.exports = TerminalModel;