import type { SqlParam } from "../types/db";
import type { RowDataPacket } from "mysql2";
import pool from "../config/db";

const MeModel = {
    async getUserInfoById(userId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_me_getUserInfoByUserId(?)`, [userId]);
        return rows[0][0] || null;
    }
};

export default MeModel;