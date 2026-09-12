import type { SqlParam } from "../types/db";
import type { RowDataPacket } from "mysql2";
import pool from "../config/db";

const RoleModel = {
    async getAll() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_roles_getAll()`);
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_roles_getAllActive()`);
        return rows[0] || [];
    },

    async findById(roleId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_roles_getById(?)`, [roleId]);
        return rows[0][0] || null;
    },
};

export default RoleModel;
