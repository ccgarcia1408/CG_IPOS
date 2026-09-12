import type { RowDataPacket } from "mysql2";
import type { SqlParam } from "../types/db";
import pool from "../config/db";

const DiscountModel = {
    async getAll() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_discounts_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_discounts_getAllActive()`);
        return rows[0] || [];
    },

    async findById(discountId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_discounts_getById(?)`, [discountId]);
        return rows[0][0] || null;
    },

    async create(name: SqlParam, description: SqlParam, type: SqlParam, value: SqlParam, isDefault: SqlParam, createdBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_discounts_create(?, ?, ?, ?, ?, ?)`,
            [name, description, type, value, isDefault, createdBy]
        );

        return rows[0][0];
    },

    async update(discountId: SqlParam, name: SqlParam, description: SqlParam, type: SqlParam, value: SqlParam, isDefault: SqlParam, updatedBy: SqlParam, isActive: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_discounts_update(?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                discountId,
                name,
                description,
                type,
                value,
                isDefault,
                updatedBy,
                isActive
            ]
        );

        return rows[0][0];
    },

    async delete(discountId: SqlParam, userId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_discounts_delete(?, ?)`,
            [
                discountId,
                userId
            ]
        );

        return rows[0][0];
    },
};

export default DiscountModel;
