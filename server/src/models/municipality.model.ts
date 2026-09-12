import type { RowDataPacket } from "mysql2";
import type { SqlParam } from "../types/db";
import pool from "../config/db";

const MunicipalityModel = {
    async getAll() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_municipalities_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_municipalities_getAllActive()`);
        return rows[0] || [];
    },

    async findById(municipalityId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_municipalities_getById(?)`, [municipalityId]);
        return rows[0][0] || null;
    },

    async findByProvinceId(provinceId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_municipalities_getByProvinceId(?)`, [provinceId]);
        return rows[0] || [];
    },

    async create(provinceId: SqlParam, name: SqlParam, createdBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_municipalities_create(?, ?, ?)`,
            [provinceId, name, createdBy]
        );

        return rows[0][0];
    },

    async update(municipalityId: SqlParam, provinceId: SqlParam, name: SqlParam, updatedBy: SqlParam, isActive: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_municipalities_update(?, ?, ?, ?, ?)`,
            [municipalityId, provinceId, name, updatedBy, isActive]
        );

        return rows[0][0];
    },

    async delete(municipalityId: SqlParam, deletedBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_municipalities_delete(?, ?)`,
            [municipalityId, deletedBy]
        );

        return rows[0][0];
    },
};

export default MunicipalityModel;