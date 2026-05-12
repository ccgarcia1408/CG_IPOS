const pool = require("../config/db");

const CategoryModel = {
    async getAll() {
        const [rows] = await pool.query(`CALL sp_categories_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query(`CALL sp_categories_getAllActive()`);
        return rows[0] || [];
    },
};

module.exports = CategoryModel;