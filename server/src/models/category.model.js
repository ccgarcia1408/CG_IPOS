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

    async create(branchId, name, description, createdBy) {
        const [rows] = await pool.query(
            `CALL sp_categories_create(?, ?, ?, ?)`,
            [branchId, name, description, createdBy]
        );

        return rows[0][0];
    },

    async update(categoryId, branchId, name, description, updatedBy, isActive) {
        const [rows] = await pool.query(
            `CALL sp_categories_update(?, ?, ?, ?, ?, ?)`,
            [categoryId, branchId, name, description, updatedBy, isActive]
        );

        return rows[0][0];
    },

    async delete(categoryId, deletedBy) {
        const [rows] = await pool.query(
            `CALL sp_categories_delete(?, ?)`,
            [categoryId, deletedBy]
        );

        return rows[0][0];
    },
};

module.exports = CategoryModel;
