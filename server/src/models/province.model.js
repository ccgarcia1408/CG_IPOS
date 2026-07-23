const pool = require("../config/db");

const ProvinceModel = {
    async getAll() {
        const [rows] = await pool.query(`CALL sp_provinces_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query(`CALL sp_provinces_getAllActive()`);
        return rows[0] || [];
    },

    async findById(provinceId) {
        const [rows] = await pool.query(`CALL sp_provinces_getById(?)`, [provinceId]);
        return rows[0][0] || null;
    },

    async create(regionId, name, createdBy) {
        const [rows] = await pool.query(
            `CALL sp_provinces_create(?, ?, ?)`,
            [regionId, name, createdBy]
        );

        return rows[0][0];
    },

    async update(provinceId, regionId, name, updatedBy, isActive) {
        const [rows] = await pool.query(
            `CALL sp_provinces_update(?, ?, ?, ?, ?)`,
            [
                provinceId,
                regionId,
                name,
                updatedBy,
                isActive
            ]
        );

        return rows[0][0];
    },

    async delete(provinceId, userId) {
        const [rows] = await pool.query(
            `CALL sp_provinces_delete(?, ?)`,
            [
                provinceId,
                userId
            ]
        );

        return rows[0][0];
    },
};

module.exports = ProvinceModel;