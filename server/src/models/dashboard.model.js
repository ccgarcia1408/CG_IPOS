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
    },

    async getSalesByPaymentMethod(startDate, endDate, branchId) {
        const [rows] = await pool.query(
            `CALL sp_dashboard_salesByPaymentMethod(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0] || [];
    },

    async getSalesByBranch(startDate, endDate, branchId) {
        const [rows] = await pool.query(
            `CALL sp_dashboard_salesByBranch(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0] || [];
    },

    async getSalesByTerminal(startDate, endDate, branchId) {
        const [rows] = await pool.query(
            `CALL sp_dashboard_salesByTerminal(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0] || [];
    },

    async getTopProducts(startDate, endDate, branchId, sortBy) {
        const [rows] = await pool.query(
            `CALL sp_dashboard_topProducts(?, ?, ?, ?)`,
            [startDate, endDate, branchId, sortBy]
        );

        return rows[0] || [];
    },

    async getTopCategories(startDate, endDate, branchId) {
        const [rows] = await pool.query(
            `CALL sp_dashboard_topCategories(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0] || [];
    },

    async getInventorySummary(branchId, expiringDays) {
        const [rows] = await pool.query(
            `CALL sp_dashboard_inventorySummary(?, ?)`,
            [branchId, expiringDays]
        );

        return rows[0][0];
    },

    async getLowStockAlerts(branchId) {
        const [rows] = await pool.query(`CALL sp_dashboard_lowStockAlerts(?)`, [branchId]);
        return rows[0] || [];
    },

    async getOutOfStockAlerts(branchId) {
        const [rows] = await pool.query(`CALL sp_dashboard_outOfStockAlerts(?)`, [branchId]);
        return rows[0] || [];
    },

    async getExpiringProducts(branchId, thresholdDays) {
        const [rows] = await pool.query(
            `CALL sp_dashboard_expiringProducts(?, ?)`,
            [branchId, thresholdDays]
        );

        return rows[0] || [];
    }
};

module.exports = DashboardModel;
