import type { RowDataPacket } from "mysql2";
import type { SqlParam } from "../types/db";
import pool from "../config/db";

const EmployeeModel = {
    async updateProfilePictureByUserId(userId: SqlParam, profilePicture: SqlParam, updatedBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_employees_updateProfilePictureByUserId(?, ?, ?)`,
            [userId, profilePicture, updatedBy]
        );

        return rows[0][0];
    }
};

export default EmployeeModel;
