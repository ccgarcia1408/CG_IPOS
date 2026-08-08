const pool = require("../config/db");

const ProductModel = {
    async getAll() {
        const [rows] = await pool.query(`CALL sp_products_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query(`CALL sp_products_getAllActive()`);
        return rows[0] || [];
    },

    async findById(productId) {
        const [rows] = await pool.query(`CALL sp_products_getById(?)`, [productId]);
        return rows[0][0] || null;
    },

    async create(branchId, categoryId, name, description, barcode, sku, costPrice, sellingPrice, stock, minimumStock, manufacturingDate, expiryDate, imagePath, createdBy) {
        const [rows] = await pool.query(
            `CALL sp_products_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [branchId, categoryId, name, description, barcode, sku, costPrice, sellingPrice, stock, minimumStock, manufacturingDate, expiryDate, imagePath, createdBy]
        );

        return rows[0][0];
    },

    async update(productId, branchId, categoryId, name, description, barcode, sku, costPrice, sellingPrice, stock, minimumStock, manufacturingDate, expiryDate, imagePath, updatedBy, isActive) {
        const [rows] = await pool.query(
            `CALL sp_products_update(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [productId, branchId, categoryId, name, description, barcode, sku, costPrice, sellingPrice, stock, minimumStock, manufacturingDate, expiryDate, imagePath, updatedBy, isActive]
        );

        return rows[0][0];
    },

    async delete(productId, userId) {
        const [rows] = await pool.query(
            `CALL sp_products_delete(?, ?)`,
            [
                productId,
                userId
            ]
        );

        return rows[0][0];
    },
};

module.exports = ProductModel;
