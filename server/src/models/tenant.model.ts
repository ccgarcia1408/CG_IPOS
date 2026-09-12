import type { RowDataPacket } from "mysql2";
import type { SqlParam } from "../types/db";
import pool from "../config/db";

const TenantModel = {
    async getAll() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_tenants_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_tenants_getAllActive()`);
        return rows[0] || [];
    },

    async findById(tenantId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_tenants_getById(?)`, [tenantId]);
        return rows[0][0] || null;
    },

    async create(name: SqlParam, description: SqlParam, contactNo: SqlParam, email: SqlParam, createdBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_tenants_create(?, ?, ?, ?, ?)`,
            [name, description, contactNo, email, createdBy]
        );

        return rows[0][0];
    },

    async update(tenantId: SqlParam, name: SqlParam, description: SqlParam, contactNo: SqlParam, email: SqlParam, updatedBy: SqlParam, isActive: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_tenants_update(?, ?, ?, ?, ?, ?, ?)`,
            [tenantId, name, description, contactNo, email, updatedBy, isActive]
        );

        return rows[0][0];
    },

    async delete(tenantId: SqlParam, userId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_tenants_delete(?, ?)`,
            [tenantId, userId]
        );

        return rows[0][0];
    },
};

export default TenantModel;
