const pool = require("../config/db");

const LoginModel = {
    async findByUsername(username) {
        const [rows] = await pool.query(`CALL sp_users_getByUsername(?)`, [username]);
        return rows[0][0] || null;
    }
};

module.exports = LoginModel;