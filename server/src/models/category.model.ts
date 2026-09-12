import type { RowDataPacket } from "mysql2";
import type { SqlParam } from "../types/db";
import pool from "../config/db";

const CategoryModel = {
    async getAll() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_categories_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_categories_getAllActive()`);
        return rows[0] || [];
    },

    async findById(categoryId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_categories_getById(?)`, [categoryId]);
        return rows[0][0] || null;
    },

    async create(branchId: SqlParam, name: SqlParam, description: SqlParam, createdBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_categories_create(?, ?, ?, ?)`,
            [branchId, name, description, createdBy]
        );

        return rows[0][0];
    },

    async update(categoryId: SqlParam, branchId: SqlParam, name: SqlParam, description: SqlParam, updatedBy: SqlParam, isActive: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_categories_update(?, ?, ?, ?, ?, ?)`,
            [categoryId, branchId, name, description, updatedBy, isActive]
        );

        return rows[0][0];
    },

    async delete(categoryId: SqlParam, deletedBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_categories_delete(?, ?)`,
            [categoryId, deletedBy]
        );

        return rows[0][0];
    },
};

export default CategoryModel;
