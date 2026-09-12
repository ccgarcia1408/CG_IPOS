import type { RowDataPacket } from "mysql2";
import type { SqlParam } from "../types/db";
import pool from "../config/db";

const UserModel = {
  async create(data: any, createdBy: SqlParam) {
    const [rows] = await pool.query<RowDataPacket[][]>(
      `CALL sp_users_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.FirstName,
        data.MiddleName ?? null,
        data.LastName,
        data.Email,
        data.Age ?? null,
        data.Address ?? null,
        data.ContactNo,
        data.Username,
        data.Password,
        data.RoleId ?? null,
        createdBy ?? null
      ]
    );

    return rows[0][0].UserId;
  },

  async findAll() {
    const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_users_getAll()`);
    return rows[0];
  },

  async findById(userId: SqlParam) {
    const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_users_getById(?)`, [userId]);
    return rows[0][0] || null;
  },

  async findByEmail(email: SqlParam) {
    const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_users_getByEmail(?)`, [email]);
    return rows[0][0] || null;
  },

  async update(userId: SqlParam, data: any, updatedBy: SqlParam) {
    const [rows] = await pool.query<RowDataPacket[][]>(
      `CALL sp_users_update(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.FirstName,
        data.MiddleName ?? null,
        data.LastName,
        data.Email,
        data.Age ?? null,
        data.Address ?? null,
        data.ContactNo,
        data.Username,
        data.Password || null,
        data.RoleId ?? null,
        data.IsActive,
        data.IsAccountVerified,
        updatedBy
      ]
    );

    return rows[0][0];
  },

  async delete(userId: SqlParam, deletedBy: SqlParam) {
    const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_users_delete(?, ?)`, [userId, deletedBy]);
    return rows[0][0];
  },

  async getBranches(userId: SqlParam) {
    const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_user_branches_getByUserId(?)`, [userId]);
    return rows[0] || [];
  },

  async replaceBranches(userId: SqlParam, branchIds: number[], updatedBy: SqlParam) {
    const [rows] = await pool.query<RowDataPacket[][]>(
      `CALL sp_user_branches_replace(?, ?, ?)`,
      [userId, JSON.stringify(branchIds), updatedBy]
    );

    return rows[0][0];
  },

  async setResetCode(email: SqlParam, resetCode: SqlParam, expiresAt: SqlParam) {
    const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_users_setResetCode(?, ?, ?)`, [email, resetCode, expiresAt]);
    return rows[0][0];
  },

  async verifyResetCode(email: SqlParam, resetCode: SqlParam) {
    const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_users_verifyResetCode(?, ?)`, [email, resetCode]);
    return rows[0][0];
  },

  async resetPassword(email: SqlParam, resetCode: SqlParam, newPasswordHash: SqlParam) {
    const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_users_resetPassword(?, ?, ?)`, [email, resetCode, newPasswordHash]);
    return rows[0][0];
  }
};

export default UserModel;