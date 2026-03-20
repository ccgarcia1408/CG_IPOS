const pool = require("../config/db");

const UserModel = {
  async create(data) {
    const [rows] = await pool.query(
      `CALL sp_users_create(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.FirstName,
        data.MiddleName ?? null,
        data.LastName,
        data.Email,
        data.Age ?? null,
        data.Address ?? null,
        data.ContactNo,
        data.Username,
        data.Password
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
  }
};

module.exports = UserModel;