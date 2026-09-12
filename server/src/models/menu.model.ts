import type { SqlParam } from "../types/db";
import type { RowDataPacket } from "mysql2";
import pool from "../config/db";

const MenuModel = {
    async getAll() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_menus_getAll()`);
        return rows[0] || [];
    },

    async getByRoleId(roleId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_menus_getByRoleId(?)`, [roleId]);
        return rows[0] || [];
    },
};

export default MenuModel;