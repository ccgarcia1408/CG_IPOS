import type { RowDataPacket } from "mysql2";
import type { SqlParam } from "../types/db";
import pool from "../config/db";

const PaymentMethodModel = {
    async getAll() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_payment_methods_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_payment_methods_getAllActive()`);
        return rows[0] || [];
    },

    async findById(paymentMethodId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_payment_methods_getById(?)`, [paymentMethodId]);
        return rows[0][0] || null;
    },

    async create(name: SqlParam, description: SqlParam, createdBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_payment_methods_create(?, ?, ?)`,
            [name, description, createdBy]
        );

        return rows[0][0];
    },

    async update(paymentMethodId: SqlParam, name: SqlParam, description: SqlParam, updatedBy: SqlParam, isActive: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
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

    async delete(paymentMethodId: SqlParam, userId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_payment_methods_delete(?, ?)`,
            [
                paymentMethodId,
                userId
            ]
        );

        return rows[0][0];
    },
};

export default PaymentMethodModel;