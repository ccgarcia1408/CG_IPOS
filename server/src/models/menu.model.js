const pool = require("../config/db");

const MenuModel = {
    async getAll() {
        const [rows] = await pool.query(`CALL sp_menus_getAll()`);
        return rows[0] || [];
    },

    async getByRoleId(roleId) {
        const [rows] = await pool.query(`CALL sp_menus_getByRoleId(?)`, [roleId]);
        return rows[0] || [];
    },
};

module.exports = MenuModel;