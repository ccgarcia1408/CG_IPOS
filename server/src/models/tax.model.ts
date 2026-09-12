import type { RowDataPacket } from "mysql2";
import type { SqlParam } from "../types/db";
import pool from "../config/db";

const TaxModel = {
    async getAll() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_taxes_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_taxes_getAllActive()`);
        return rows[0] || [];
    },

    async findById(taxId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_taxes_getById(?)`, [taxId]);
        return rows[0][0] || null;
    },

    async create(name: SqlParam, description: SqlParam, rate: SqlParam, isDefault: SqlParam, createdBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_taxes_create(?, ?, ?, ?, ?)`,
            [name, description, rate, isDefault, createdBy]
        );

        return rows[0][0];
    },

    async update(taxId: SqlParam, name: SqlParam, description: SqlParam, rate: SqlParam, isDefault: SqlParam, updatedBy: SqlParam, isActive: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_taxes_update(?, ?, ?, ?, ?, ?, ?)`,
            [
                taxId,
                name,
                description,
                rate,
                isDefault,
                updatedBy,
                isActive
            ]
        );

        return rows[0][0];
    },

    async delete(taxId: SqlParam, userId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_taxes_delete(?, ?)`,
            [
                taxId,
                userId
            ]
        );

        return rows[0][0];
    },
};

export default TaxModel;
