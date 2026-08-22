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
    },

    async getPurchasingSummary(startDate, endDate, branchId) {
        const [rows] = await pool.query(
            `CALL sp_dashboard_purchasingSummary(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0][0];
    },

    async getPendingPurchases(branchId) {
        const [rows] = await pool.query(`CALL sp_dashboard_pendingPurchases(?)`, [branchId]);
        return rows[0] || [];
    },

    async getSupplierSummary(startDate, endDate, branchId) {
        const [rows] = await pool.query(
            `CALL sp_dashboard_supplierSummary(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0] || [];
    },

    async getCashierPerformance(startDate, endDate, branchId) {
        const [rows] = await pool.query(
            `CALL sp_dashboard_cashierPerformance(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0] || [];
    },

    async getVoidedSales(startDate, endDate, branchId) {
        const [rows] = await pool.query(
            `CALL sp_dashboard_voidedSales(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0] || [];
    },

    async getStockAdjustmentSummary(startDate, endDate, branchId) {
        const [rows] = await pool.query(
            `CALL sp_dashboard_stockAdjustmentSummary(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0][0];
    },

    async getRecentStockAdjustments(startDate, endDate, branchId, limit) {
        const [rows] = await pool.query(
            `CALL sp_dashboard_recentStockAdjustments(?, ?, ?, ?)`,
            [startDate, endDate, branchId, limit]
        );

        return rows[0] || [];
    },

    async getOfficialReceiptSummary(startDate, endDate, branchId) {
        const [rows] = await pool.query(
            `CALL sp_dashboard_officialReceiptSummary(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0][0];
    },

    async getOrAssignmentStatus() {
        const [rows] = await pool.query(`CALL sp_dashboard_orAssignmentStatus()`);
        return rows[0] || [];
    },

    async getReturnReasons(startDate, endDate, branchId) {
        const [rows] = await pool.query(
            `CALL sp_dashboard_returnReasons(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0] || [];
    },

    async getTopReturnedProducts(startDate, endDate, branchId, limit) {
        const [rows] = await pool.query(
            `CALL sp_dashboard_topReturnedProducts(?, ?, ?, ?)`,
            [startDate, endDate, branchId, limit]
        );

        return rows[0] || [];
    },

    async getRecentSales(startDate, endDate, branchId, limit) {
        const [rows] = await pool.query(
            `CALL sp_dashboard_recentSales(?, ?, ?, ?)`,
            [startDate, endDate, branchId, limit]
        );

        return rows[0] || [];
    },

    async getRecentPurchases(startDate, endDate, branchId, limit) {
        const [rows] = await pool.query(
            `CALL sp_dashboard_recentPurchases(?, ?, ?, ?)`,
            [startDate, endDate, branchId, limit]
        );

        return rows[0] || [];
    },

    async getRecentActivity(startDate, endDate, limit) {
        const [rows] = await pool.query(
            `CALL sp_dashboard_recentActivity(?, ?, ?)`,
            [startDate, endDate, limit]
        );

        return rows[0] || [];
    }
};

module.exports = DashboardModel;
