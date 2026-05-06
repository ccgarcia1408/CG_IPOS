const pool = require("../config/db");

const TerminalModel = {
    async getAll() {
        const [rows] = await pool.query(`CALL sp_terminals_getAll()`);
        return rows[0] || [];
    },

};

module.exports = TerminalModel;