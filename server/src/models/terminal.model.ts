import type { RowDataPacket } from "mysql2";
import type { SqlParam } from "../types/db";
import pool from "../config/db";

const TerminalModel = {
    async getAll() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_terminals_getAll()`);
        return rows[0] || [];
    },
    
    async getAllActive() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_terminals_getAllActive()`);
        return rows[0] || [];
    },

    async findById(terminalId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_terminals_getById(?)`, [terminalId]);
        return rows[0][0] || null;
    },
    async create(branchId: SqlParam, name: SqlParam, description: SqlParam, userId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_terminals_create(?, ?, ?, ?)`,
            [branchId, name, description, userId]
        );

        return rows[0][0];
    },

    async update(terminalId: SqlParam, branchId: SqlParam, name: SqlParam, description: SqlParam, userId: SqlParam, isActive: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_terminals_update(?, ?, ?, ?, ?, ?)`,
            [terminalId, branchId, name, description, userId, isActive]
        );

        return rows[0][0];
    },

    async delete(terminalId: SqlParam, userId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_terminals_delete(?, ?)`,
            [terminalId, userId]
        );

        return rows[0][0];
    },

};

export default TerminalModel;
