const pool = require("../config/db");

const LoginModel = {
    async findByUsername(username) {
        const [rows] = await pool.query(`CALL sp_users_getByUsername(?)`, [username]);
        return rows[0][0] || null;
    },

    async getUserInfo(username) {
        const [rows] = await pool.query(`CALL sp_users_getUserInfo(?)`, [username]);
        return rows[0][0] || null;
    }, 

    async updateLastLogin(username) {
        await pool.query(`CALL sp_users_updateLastLoginDate(?)`, [username]);
    },

    async updateLastLogout(username) {
        await pool.query(`CALL sp_users_updateLastLogoutDate(?)`, [username]);
    }
};

module.exports = LoginModel;