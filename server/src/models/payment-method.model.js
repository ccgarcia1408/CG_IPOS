const pool = require("../config/db");

const PaymentMethodModel = {
    async getAll() {
        const [rows] = await pool.query(`CALL sp_payment_methods_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query(`CALL sp_payment_methods_getAllActive()`);
        return rows[0] || [];
    },

    async findById(paymentMethodId) {
        const [rows] = await pool.query(`CALL sp_payment_methods_getById(?)`, [paymentMethodId]);
        return rows[0][0] || null;
    },

    async create(name, description, createdBy) {
        const [rows] = await pool.query(
            `CALL sp_payment_methods_create(?, ?, ?)`,
            [name, description, createdBy]
        );

        return rows[0][0];
    },

    async update(paymentMethodId, name, description, updatedBy, isActive) {
        const [rows] = await pool.query(
            `CALL sp_payment_methods_update(?, ?, ?, ?, ?)`,
            [
                paymentMethodId,
                name,
                description,
                updatedBy,
                isActive
            ]
        );

        return rows[0][0];
    },

    async delete(paymentMethodId, userId) {
        const [rows] = await pool.query(
            `CALL sp_payment_methods_delete(?, ?)`,
            [
                paymentMethodId,
                userId
            ]
        );

        return rows[0][0];
    },
};

module.exports = PaymentMethodModel;