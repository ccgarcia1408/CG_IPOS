const pool = require("../config/db");

const RoleModel = {
    async getAll() {
        const [rows] = await pool.query(`CALL sp_roles_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query(`CALL sp_roles_getAllActive()`);
        return rows[0] || [];
    },

    async findById(roleId) {
        const [rows] = await pool.query(`CALL sp_roles_getById(?)`, [roleId]);
        return rows[0][0] || null;
    },
};

module.exports = RoleModel;
