const pool = require("../config/db");

const EmployeeModel = {
    async updateProfilePictureByUserId(userId, profilePicture, updatedBy) {
        const [rows] = await pool.query(
            `CALL sp_employees_updateProfilePictureByUserId(?, ?, ?)`,
            [userId, profilePicture, updatedBy]
        );

        return rows[0][0];
    }
};

module.exports = EmployeeModel;
