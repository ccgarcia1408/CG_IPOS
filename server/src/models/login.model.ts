import type { RowDataPacket } from "mysql2";
import type { SqlParam } from "../types/db";
import pool from "../config/db";

const LoginModel = {
    async findByUsername(username: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_users_getByUsername(?)`, [username]);
        return rows[0][0] || null;
    },

    async getUserInfo(username: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_users_getUserInfo(?)`, [username]);
        return rows[0][0] || null;
    }, 

    async updateLastLogin(username: SqlParam) {
        await pool.query<RowDataPacket[][]>(`CALL sp_users_updateLastLoginDate(?)`, [username]);
    },

    async updateLastLogout(username: SqlParam) {
        await pool.query<RowDataPacket[][]>(`CALL sp_users_updateLastLogoutDate(?)`, [username]);
    }
};

export default LoginModel;