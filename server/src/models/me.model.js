const pool = require("../config/db");

const MeModel = {
    async getUserInfoById(userId) {
        const [rows] = await pool.query(`CALL sp_login_getUserInfoById(?)`, [userId]);
        return rows[0][0] || null;
    }
};

module.exports = MeModel;