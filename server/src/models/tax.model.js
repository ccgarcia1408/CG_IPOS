const pool = require("../config/db");

const TaxModel = {
    async getAll() {
        const [rows] = await pool.query(`CALL sp_taxes_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query(`CALL sp_taxes_getAllActive()`);
        return rows[0] || [];
    },

    async findById(taxId) {
        const [rows] = await pool.query(`CALL sp_taxes_getById(?)`, [taxId]);
        return rows[0][0] || null;
    },

    async create(name, description, rate, createdBy) {
        const [rows] = await pool.query(
            `CALL sp_taxes_create(?, ?, ?, ?)`,
            [name, description, rate, createdBy]
        );

        return rows[0][0];
    },

    async update(taxId, name, description, rate, updatedBy, isActive) {
        const [rows] = await pool.query(
            `CALL sp_taxes_update(?, ?, ?, ?, ?, ?)`,
            [
                taxId,
                name,
                description,
                rate,
                updatedBy,
                isActive
            ]
        );

        return rows[0][0];
    },

    async delete(taxId, userId) {
        const [rows] = await pool.query(
            `CALL sp_taxes_delete(?, ?)`,
            [
                taxId,
                userId
            ]
        );

        return rows[0][0];
    },
};

module.exports = TaxModel;
