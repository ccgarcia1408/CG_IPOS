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

    async findById(categoryId) {
        const [rows] = await pool.query(`CALL sp_categories_getById(?)`, [categoryId]);
        return rows[0][0] || null;
    },
};

module.exports = CategoryModel;