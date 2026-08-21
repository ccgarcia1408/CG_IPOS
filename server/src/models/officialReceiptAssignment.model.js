const pool = require("../config/db");

const OfficialReceiptAssignmentModel = {
    async getAll() {
        const [rows] = await pool.query("CALL sp_official_receipt_assignments_getAll()");
        return rows[0] || [];
    },

    async findById(orAssignmentId) {
        const [rows] = await pool.query("CALL sp_official_receipt_assignments_getById(?)", [orAssignmentId]);
        return rows[0][0] || null;
    },

    async findActiveByUserId(userId) {
        const [rows] = await pool.query("CALL sp_official_receipt_assignments_getActiveByUserId(?)", [userId]);
        return rows[0][0] || null;
    },

    async create(orFrom, orTo, userId, createdBy) {
        const [rows] = await pool.query(
            "CALL sp_official_receipt_assignments_create(?, ?, ?, ?)",
            [orFrom, orTo, userId, createdBy]
        );
        return rows[0][0];
    },

    async update(orAssignmentId, orTo, userId, updatedBy) {
        const [rows] = await pool.query(
            "CALL sp_official_receipt_assignments_update(?, ?, ?, ?)",
            [orAssignmentId, orTo, userId, updatedBy]
        );
        return rows[0][0];
    },

    async delete(orAssignmentId, deletedBy) {
        const [rows] = await pool.query(
            "CALL sp_official_receipt_assignments_delete(?, ?)",
            [orAssignmentId, deletedBy]
        );
        return rows[0][0];
    },
};

module.exports = OfficialReceiptAssignmentModel;
