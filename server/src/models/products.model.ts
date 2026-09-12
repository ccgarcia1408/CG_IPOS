import type { RowDataPacket } from "mysql2";
import type { SqlParam } from "../types/db";
import pool from "../config/db";

const ProductModel = {
    async getAll() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_products_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_products_getAllActive()`);
        return rows[0] || [];
    },

    async findById(productId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_products_getById(?)`, [productId]);
        return rows[0][0] || null;
    },

    async create(categoryId: SqlParam, name: SqlParam, description: SqlParam, barcode: SqlParam, sku: SqlParam, costPrice: SqlParam, sellingPrice: SqlParam, manufacturingDate: SqlParam, expiryDate: SqlParam, imagePath: SqlParam, createdBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_products_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [categoryId, name, description, barcode, sku, costPrice, sellingPrice, manufacturingDate, expiryDate, imagePath, createdBy]
        );

        return rows[0][0];
    },

    async update(productId: SqlParam, categoryId: SqlParam, name: SqlParam, description: SqlParam, barcode: SqlParam, sku: SqlParam, costPrice: SqlParam, sellingPrice: SqlParam, manufacturingDate: SqlParam, expiryDate: SqlParam, imagePath: SqlParam, updatedBy: SqlParam, isActive: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_products_update(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [productId, categoryId, name, description, barcode, sku, costPrice, sellingPrice, manufacturingDate, expiryDate, imagePath, updatedBy, isActive]
        );

        return rows[0][0];
    },

    async delete(productId: SqlParam, userId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_products_delete(?, ?)`,
            [
                productId,
                userId
            ]
        );

        return rows[0][0];
    },
};

export default ProductModel;
