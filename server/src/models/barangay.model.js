const pool = require("../config/db");

const BarangayModel = {
    async getAll() {
        const [rows] = await pool.query(`CALL sp_barangays_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query(`CALL sp_barangays_getAllActive()`);
        return rows[0] || [];
    },

    async findById(barangayId) {
        const [rows] = await pool.query(`CALL sp_barangays_getById(?)`, [barangayId]);
        return rows[0][0] || null;
    },

    async findByMunicipalityId(municipalityId) {
        const [rows] = await pool.query(`CALL sp_barangays_getByMunicipalityId(?)`, [municipalityId]);
        return rows[0] || [];
    },

    async create(municipalityId, name, createdBy) {
        const [rows] = await pool.query(
            `CALL sp_barangays_create(?, ?, ?)`,
            [municipalityId, name, createdBy]
        );

        return rows[0][0];
    },

    async update(barangayId, municipalityId, name, updatedBy, isActive) {
        const [rows] = await pool.query(
            `CALL sp_barangays_update(?, ?, ?, ?, ?)`,
            [barangayId, municipalityId, name, updatedBy, isActive]
        );

        return rows[0][0];
    },

    async delete(barangayId, deletedBy) {
        const [rows] = await pool.query(
            `CALL sp_barangays_delete(?, ?)`,
            [barangayId, deletedBy]
        );

        return rows[0][0];
    },
};

module.exports = BarangayModel;