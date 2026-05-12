const pool = require("../config/db");

const BranchModel = {
    async getAll() {
        const [rows] = await pool.query(`CALL sp_branches_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query(`CALL sp_branches_getAllActive()`);
        return rows[0] || [];
    },
};

module.exports = BranchModel;