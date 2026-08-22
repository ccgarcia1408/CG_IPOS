const pool = require("../config/db");

const DashboardModel = {
    async getSalesSummary(startDate, endDate, branchId) {
        const [rows] = await pool.query(
            `CALL sp_dashboard_salesSummary(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0][0];
    },

    async getSalesTrend(startDate, endDate, branchId, granularity) {
        const [rows] = await pool.query(
            `CALL sp_dashboard_salesTrend(?, ?, ?, ?)`,
            [startDate, endDate, branchId, granularity]
        );

        return rows[0] || [];
    }
};

module.exports = DashboardModel;
