const pool = require("../config/db");

const UserModel = {
  async create(data) {
    const sql = `
      INSERT INTO users (FirstName, LastName, Email, Age, Address)
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
      data.FirstName,
      data.LastName,
      data.Email,
      data.Age ?? null,
      data.Address ?? null
    ];

    const [result] = await pool.execute(sql, params);
    return result.insertId;
  },

  async findAll() {
    const sql = `
      SELECT UserId, FirstName, LastName, Email, Age, Address, CreatedAt, UpdatedAt
      FROM users
      ORDER BY UserId DESC
    `;
    const [rows] = await pool.execute(sql);
    return rows;
  },

  async findById(userId) {
    const sql = `
      SELECT UserId, FirstName, LastName, Email, Age, Address, CreatedAt, UpdatedAt
      FROM users
      WHERE UserId = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [userId]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    const sql = `
      SELECT UserId, FirstName, LastName, Email
      FROM users
      WHERE Email = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [email]);
    return rows[0] || null;
  },

  async update(userId, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach((key) => {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    });

    values.push(userId);

    const sql = `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE UserId = ?
    `;

    const [result] = await pool.execute(sql, values);
    return result.affectedRows;
  },

  async delete(userId) {
    const sql = `DELETE FROM users WHERE UserId = ?`;
    const [result] = await pool.execute(sql, [userId]);
    return result.affectedRows;
  }
};

module.exports = UserModel;