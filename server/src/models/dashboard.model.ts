import type { RowDataPacket } from "mysql2";
import type { SqlParam } from "../types/db";
import pool from "../config/db";

const DashboardModel = {
    async getSalesSummary(startDate: SqlParam, endDate: SqlParam, branchId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_salesSummary(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0][0];
    },

    async getSalesTrend(startDate: SqlParam, endDate: SqlParam, branchId: SqlParam, granularity: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_salesTrend(?, ?, ?, ?)`,
            [startDate, endDate, branchId, granularity]
        );

        return rows[0] || [];
    },

    async getSalesByPaymentMethod(startDate: SqlParam, endDate: SqlParam, branchId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_salesByPaymentMethod(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0] || [];
    },

    async getSalesByBranch(startDate: SqlParam, endDate: SqlParam, branchId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_salesByBranch(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0] || [];
    },

    async getSalesByTerminal(startDate: SqlParam, endDate: SqlParam, branchId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_salesByTerminal(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0] || [];
    },

    async getTopProducts(startDate: SqlParam, endDate: SqlParam, branchId: SqlParam, sortBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_topProducts(?, ?, ?, ?)`,
            [startDate, endDate, branchId, sortBy]
        );

        return rows[0] || [];
    },

    async getTopCategories(startDate: SqlParam, endDate: SqlParam, branchId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_topCategories(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0] || [];
    },

    async getInventorySummary(branchId: SqlParam, expiringDays: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_inventorySummary(?, ?)`,
            [branchId, expiringDays]
        );

        return rows[0][0];
    },

    async getLowStockAlerts(branchId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_dashboard_lowStockAlerts(?)`, [branchId]);
        return rows[0] || [];
    },

    async getOutOfStockAlerts(branchId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_dashboard_outOfStockAlerts(?)`, [branchId]);
        return rows[0] || [];
    },

    async getExpiringProducts(branchId: SqlParam, thresholdDays: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_expiringProducts(?, ?)`,
            [branchId, thresholdDays]
        );

        return rows[0] || [];
    },

    async getPurchasingSummary(startDate: SqlParam, endDate: SqlParam, branchId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_purchasingSummary(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0][0];
    },

    async getPendingPurchases(branchId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_dashboard_pendingPurchases(?)`, [branchId]);
        return rows[0] || [];
    },

    async getSupplierSummary(startDate: SqlParam, endDate: SqlParam, branchId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_supplierSummary(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0] || [];
    },

    async getCashierPerformance(startDate: SqlParam, endDate: SqlParam, branchId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_cashierPerformance(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0] || [];
    },

    async getVoidedSales(startDate: SqlParam, endDate: SqlParam, branchId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_voidedSales(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0] || [];
    },

    async getStockAdjustmentSummary(startDate: SqlParam, endDate: SqlParam, branchId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_stockAdjustmentSummary(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0][0];
    },

    async getRecentStockAdjustments(startDate: SqlParam, endDate: SqlParam, branchId: SqlParam, limit: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_recentStockAdjustments(?, ?, ?, ?)`,
            [startDate, endDate, branchId, limit]
        );

        return rows[0] || [];
    },

    async getOfficialReceiptSummary(startDate: SqlParam, endDate: SqlParam, branchId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_officialReceiptSummary(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0][0];
    },

    async getOrAssignmentStatus() {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_dashboard_orAssignmentStatus()`);
        return rows[0] || [];
    },

    async getReturnReasons(startDate: SqlParam, endDate: SqlParam, branchId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_returnReasons(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0] || [];
    },

    async getTopReturnedProducts(startDate: SqlParam, endDate: SqlParam, branchId: SqlParam, limit: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_topReturnedProducts(?, ?, ?, ?)`,
            [startDate, endDate, branchId, limit]
        );

        return rows[0] || [];
    },

    async getRecentSales(startDate: SqlParam, endDate: SqlParam, branchId: SqlParam, limit: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_recentSales(?, ?, ?, ?)`,
            [startDate, endDate, branchId, limit]
        );

        return rows[0] || [];
    },

    async getRecentPurchases(startDate: SqlParam, endDate: SqlParam, branchId: SqlParam, limit: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_recentPurchases(?, ?, ?, ?)`,
            [startDate, endDate, branchId, limit]
        );

        return rows[0] || [];
    },

    async getRecentActivity(startDate: SqlParam, endDate: SqlParam, limit: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_recentActivity(?, ?, ?)`,
            [startDate, endDate, limit]
        );

        return rows[0] || [];
    },

    async getActiveShifts(branchId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_dashboard_activeShifts(?)`, [branchId]);
        return rows[0] || [];
    },

    async getShiftClosingSummary(startDate: SqlParam, endDate: SqlParam, branchId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            `CALL sp_dashboard_shiftClosingSummary(?, ?, ?)`,
            [startDate, endDate, branchId]
        );

        return rows[0] || [];
    },

    async getTerminalStatus(branchId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(`CALL sp_dashboard_terminalStatus(?)`, [branchId]);
        return rows[0] || [];
    }
};

export default DashboardModel;
