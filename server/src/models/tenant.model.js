const pool = require("../config/db");

const TenantModel = {
    async getAll() {
        const [rows] = await pool.query(`CALL sp_tenants_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query(`CALL sp_tenants_getAllActive()`);
        return rows[0] || [];
    },

    async findById(tenantId) {
        const [rows] = await pool.query(`CALL sp_tenants_getById(?)`, [tenantId]);
        return rows[0][0] || null;
    },

    async create(name, description, contactNo, email, createdBy) {
        const [rows] = await pool.query(
            `CALL sp_tenants_create(?, ?, ?, ?, ?)`,
            [name, description, contactNo, email, createdBy]
        );

        return rows[0][0];
    },

    async update(tenantId, name, description, contactNo, email, updatedBy, isActive) {
        const [rows] = await pool.query(
            `CALL sp_tenants_update(?, ?, ?, ?, ?, ?, ?)`,
            [tenantId, name, description, contactNo, email, updatedBy, isActive]
        );

        return rows[0][0];
    },

    async delete(tenantId, userId) {
        const [rows] = await pool.query(
            `CALL sp_tenants_delete(?, ?)`,
            [tenantId, userId]
        );

        return rows[0][0];
    },
};

module.exports = TenantModel;
