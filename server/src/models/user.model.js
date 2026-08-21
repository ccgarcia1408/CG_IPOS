const pool = require("../config/db");

const UserModel = {
  async create(data, createdBy) {
    const [rows] = await pool.query(
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
    const [rows] = await pool.query(`CALL sp_users_getAll()`);
    return rows[0];
  },

  async findById(userId) {
    const [rows] = await pool.query(`CALL sp_users_getById(?)`, [userId]);
    return rows[0][0] || null;
  },

  async findByEmail(email) {
    const [rows] = await pool.query(`CALL sp_users_getByEmail(?)`, [email]);
    return rows[0][0] || null;
  },

  async update(userId, data, updatedBy) {
    const [rows] = await pool.query(
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

  async delete(userId, deletedBy) {
    const [rows] = await pool.query(`CALL sp_users_delete(?, ?)`, [userId, deletedBy]);
    return rows[0][0];
  }
};

module.exports = UserModel;