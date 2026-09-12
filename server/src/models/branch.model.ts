import type { RowDataPacket } from "mysql2";
import type { SqlParam } from "../types/db";
import pool from "../config/db";

const BranchModel = {
    async getAll() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_branches_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_branches_getAllActive()`);
        return rows[0] || [];
    },

    async findById(branchId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_branches_getById(?)`, [branchId]);
        return rows[0][0] || null;
    },

    async create(tenantId: SqlParam, name: SqlParam, description: SqlParam, contactNo: SqlParam, provinceId: SqlParam, municipalityId: SqlParam, barangayId: SqlParam, otherAddress: SqlParam, createdBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_branches_create(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [tenantId, name, description, contactNo, provinceId, municipalityId, barangayId, otherAddress, createdBy]
        );

        return rows[0][0];
    },

    async update(branchId: SqlParam, tenantId: SqlParam, name: SqlParam, description: SqlParam, contactNo: SqlParam, provinceId: SqlParam, municipalityId: SqlParam, barangayId: SqlParam, otherAddress: SqlParam, updatedBy: SqlParam, isActive: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
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

    async delete(branchId: SqlParam, userId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_branches_delete(?, ?)`,
            [
                branchId,
                userId
            ]
        );

        return rows[0][0];
    },
};

export default BranchModel;