import type { RowDataPacket } from "mysql2";
import type { SqlParam } from "../types/db";
import pool from "../config/db";

const OfficialReceiptAssignmentModel = {
    async getAll() {
        const [rows] = await pool.query<RowDataPacket[][]>("CALL sp_official_receipt_assignments_getAll()");
        return rows[0] || [];
    },

    async findById(orAssignmentId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>("CALL sp_official_receipt_assignments_getById(?)", [orAssignmentId]);
        return rows[0][0] || null;
    },

    async findActiveByUserId(userId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>("CALL sp_official_receipt_assignments_getActiveByUserId(?)", [userId]);
        return rows[0][0] || null;
    },

    async create(orFrom: SqlParam, orTo: SqlParam, userId: SqlParam, createdBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            "CALL sp_official_receipt_assignments_create(?, ?, ?, ?)",
            [orFrom, orTo, userId, createdBy]
        );
        return rows[0][0];
    },

    async update(orAssignmentId: SqlParam, orTo: SqlParam, userId: SqlParam, updatedBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            "CALL sp_official_receipt_assignments_update(?, ?, ?, ?)",
            [orAssignmentId, orTo, userId, updatedBy]
        );
        return rows[0][0];
    },

    async delete(orAssignmentId: SqlParam, deletedBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            "CALL sp_official_receipt_assignments_delete(?, ?)",
            [orAssignmentId, deletedBy]
        );
        return rows[0][0];
    },
};

export default OfficialReceiptAssignmentModel;
