import type { RowDataPacket } from "mysql2";
import type { SqlParam } from "../types/db";
import pool from "../config/db";

const ProvinceModel = {
    async getAll() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_provinces_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_provinces_getAllActive()`);
        return rows[0] || [];
    },

    async findById(provinceId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_provinces_getById(?)`, [provinceId]);
        return rows[0][0] || null;
    },

    async create(regionId: SqlParam, name: SqlParam, createdBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_provinces_create(?, ?, ?)`,
            [regionId, name, createdBy]
        );

        return rows[0][0];
    },

    async update(provinceId: SqlParam, regionId: SqlParam, name: SqlParam, updatedBy: SqlParam, isActive: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
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

    async delete(provinceId: SqlParam, userId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_provinces_delete(?, ?)`,
            [
                provinceId,
                userId
            ]
        );

        return rows[0][0];
    },
};

export default ProvinceModel;