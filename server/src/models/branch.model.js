const pool = require("../config/db");

const BranchModel = {
    async getAll() {
        const [rows] = await pool.query(`CALL sp_branches_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query(`CALL sp_branches_getAllActive()`);
        return rows[0] || [];
    },

    async findById(branchId) {
        const [rows] = await pool.query(`CALL sp_branches_getById(?)`, [branchId]);
        return rows[0][0] || null;
    },

    async create(tenantId, name, description, contactNo, provinceId, municipalityId, barangayId, otherAddress, createdBy) {
        const [rows] = await pool.query(
            `CALL sp_branches_create(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [tenantId, name, description, contactNo, provinceId, municipalityId, barangayId, otherAddress, createdBy]
        );

        return rows[0][0];
    },

    async update(branchId, tenantId, name, description, contactNo, provinceId, municipalityId, barangayId, otherAddress, updatedBy, isActive) {
        const [rows] = await pool.query(
            `CALL sp_branches_update(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                branchId,
                tenantId,
                name,
                description,
                contactNo,
                provinceId,
                municipalityId,
                barangayId,
                otherAddress,
                updatedBy,
                isActive
            ]
        );

        return rows[0][0];
    },

    async delete(branchId, userId) {
        const [rows] = await pool.query(
            `CALL sp_branches_delete(?, ?)`,
            [
                branchId,
                userId
            ]
        );

        return rows[0][0];
    },
};

module.exports = BranchModel;