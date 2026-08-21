const pool = require("../config/db");

const DiscountModel = {
    async getAll() {
        const [rows] = await pool.query(`CALL sp_discounts_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query(`CALL sp_discounts_getAllActive()`);
        return rows[0] || [];
    },

    async findById(discountId) {
        const [rows] = await pool.query(`CALL sp_discounts_getById(?)`, [discountId]);
        return rows[0][0] || null;
    },

    async create(name, description, type, value, createdBy) {
        const [rows] = await pool.query(
            `CALL sp_discounts_create(?, ?, ?, ?, ?)`,
            [name, description, type, value, createdBy]
        );

        return rows[0][0];
    },

    async update(discountId, name, description, type, value, updatedBy, isActive) {
        const [rows] = await pool.query(
            `CALL sp_discounts_update(?, ?, ?, ?, ?, ?, ?)`,
            [
                discountId,
                name,
                description,
                type,
                value,
                updatedBy,
                isActive
            ]
        );

        return rows[0][0];
    },

    async delete(discountId, userId) {
        const [rows] = await pool.query(
            `CALL sp_discounts_delete(?, ?)`,
            [
                discountId,
                userId
            ]
        );

        return rows[0][0];
    },
};

module.exports = DiscountModel;
