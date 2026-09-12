import type { RowDataPacket } from "mysql2";
import type { SqlParam } from "../types/db";
import pool from "../config/db";

const BarangayModel = {
    async getAll() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_barangays_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_barangays_getAllActive()`);
        return rows[0] || [];
    },

    async findById(barangayId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_barangays_getById(?)`, [barangayId]);
        return rows[0][0] || null;
    },

    async findByMunicipalityId(municipalityId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_barangays_getByMunicipalityId(?)`, [municipalityId]);
        return rows[0] || [];
    },

    async create(municipalityId: SqlParam, name: SqlParam, createdBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_barangays_create(?, ?, ?)`,
            [municipalityId, name, createdBy]
        );

        return rows[0][0];
    },

    async update(barangayId: SqlParam, municipalityId: SqlParam, name: SqlParam, updatedBy: SqlParam, isActive: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_barangays_update(?, ?, ?, ?, ?)`,
            [barangayId, municipalityId, name, updatedBy, isActive]
        );

        return rows[0][0];
    },

    async delete(barangayId: SqlParam, deletedBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_barangays_delete(?, ?)`,
            [barangayId, deletedBy]
        );

        return rows[0][0];
    },
};

export default BarangayModel;