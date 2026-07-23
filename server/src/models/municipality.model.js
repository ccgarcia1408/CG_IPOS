const pool = require("../config/db");

const MunicipalityModel = {
    async getAll() {
        const [rows] = await pool.query(`CALL sp_municipalities_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query(`CALL sp_municipalities_getAllActive()`);
        return rows[0] || [];
    },

    async findById(municipalityId) {
        const [rows] = await pool.query(`CALL sp_municipalities_getById(?)`, [municipalityId]);
        return rows[0][0] || null;
    },

    async findByProvinceId(provinceId) {
        const [rows] = await pool.query(`CALL sp_municipalities_getByProvinceId(?)`, [provinceId]);
        return rows[0] || [];
    },

    // async create(name, description, contactNo, provinceId, municipalityId, barangayId, createdBy) {
    //     const [rows] = await pool.query(
    //         `CALL sp_municipalities_create(?, ?, ?, ?, ?, ?, ?)`,
    //         [name, description, contactNo, provinceId, municipalityId, barangayId, createdBy]
    //     );

    //     return rows[0][0];
    // },

    // async update(municipalityId, name, description, contactNo, provinceId, municipalityId, barangayId, updatedBy, isActive) {
    //     const [rows] = await pool.query(
    //         `CALL sp_municipalities_update(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    //         [
    //             municipalityId,
    //             name,
    //             description,
    //             contactNo,
    //             provinceId,
    //             municipalityId,
    //             barangayId,
    //             updatedBy,
    //             isActive
    //         ]
    //     );

    //     return rows[0][0];
    // },

    // async delete(municipalityId, userId) {
    //     const [rows] = await pool.query(
    //         `CALL sp_municipalities_delete(?, ?)`,
    //         [
    //             municipalityId,
    //             userId
    //         ]
    //     );

    //     return rows[0][0];
    // },
};

module.exports = MunicipalityModel;