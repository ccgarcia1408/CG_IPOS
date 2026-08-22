const DashboardModel = require("../models/dashboard.model");
const ApiError = require("../utils/ApiError");

const VALID_GRANULARITIES = new Set(["HOURLY", "DAILY", "WEEKLY", "MONTHLY"]);

// Non-admins are pinned to their session branch regardless of what they pass in; Administrator
// may pass a BranchId to filter, or omit it to see every branch. This is the enforcement point
// -- branchAccess.middleware.js only resolves req.scope, it doesn't restrict anything itself.
function resolveBranchId(requestedBranchId, scope) {
    if (!scope.isAdmin) {
        return scope.BranchId;
    }

    return requestedBranchId ? Number(requestedBranchId) : null;
}

function parseDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
        throw new ApiError(400, "StartDate and EndDate are required.");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw new ApiError(400, "StartDate/EndDate must be valid dates.");
    }

    if (start > end) {
        throw new ApiError(400, "StartDate must be before EndDate.");
    }

    return { start, end };
}

function previousPeriod(start, end) {
    const durationMs = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 1000);
    const prevStart = new Date(prevEnd.getTime() - durationMs);

    return { prevStart, prevEnd };
}

function percentChange(current, previous) {
    if (previous === 0) {
        return current === 0 ? 0 : null;
    }

    return Number((((current - previous) / previous) * 100).toFixed(2));
}

function deriveKpis(row) {
    const grossSales = Number(row.GrossSales);
    const totalDiscounts = Number(row.TotalDiscounts);
    const totalReturns = Number(row.TotalReturns);
    const netSales = grossSales - totalDiscounts - totalReturns;
    const completedTransactions = Number(row.CompletedTransactions);

    return {
        GrossSales: grossSales,
        NetSales: netSales,
        CompletedTransactions: completedTransactions,
        ItemsSold: Number(row.ItemsSold),
        AverageTransactionValue: completedTransactions > 0 ? Number((netSales / completedTransactions).toFixed(2)) : 0,
        TotalDiscounts: totalDiscounts,
        TotalReturns: totalReturns,
        ReturnsCount: Number(row.ReturnsCount),
        VoidedSales: Number(row.VoidedSales),
        VoidedCount: Number(row.VoidedCount)
    };
}

const DashboardService = {
    async getSalesSummary(query, scope) {
        const { start, end } = parseDateRange(query.StartDate, query.EndDate);
        const branchId = resolveBranchId(query.BranchId, scope);
        const { prevStart, prevEnd } = previousPeriod(start, end);

        const [currentRow, previousRow] = await Promise.all([
            DashboardModel.getSalesSummary(start, end, branchId),
            DashboardModel.getSalesSummary(prevStart, prevEnd, branchId)
        ]);

        const current = deriveKpis(currentRow);
        const previous = deriveKpis(previousRow);

        const comparison = {};
        for (const key of Object.keys(current)) {
            comparison[key] = {
                Current: current[key],
                Previous: previous[key],
                PercentChange: percentChange(current[key], previous[key])
            };
        }

        return {
            BranchId: branchId,
            StartDate: start,
            EndDate: end,
            ...comparison
        };
    },

    async getSalesTrend(query, scope) {
        const { start, end } = parseDateRange(query.StartDate, query.EndDate);
        const branchId = resolveBranchId(query.BranchId, scope);
        const granularity = (query.Granularity || "DAILY").toUpperCase();

        if (!VALID_GRANULARITIES.has(granularity)) {
            throw new ApiError(400, "Granularity must be one of HOURLY, DAILY, WEEKLY, MONTHLY.");
        }

        const rows = await DashboardModel.getSalesTrend(start, end, branchId, granularity);

        return rows.map((row) => ({
            PeriodLabel: row.PeriodLabel,
            PeriodStart: row.PeriodStart,
            GrossSales: Number(row.GrossSales),
            NetSales: Number(row.GrossSales) - Number(row.TotalDiscounts),
            Transactions: Number(row.Transactions),
            ItemsSold: Number(row.ItemsSold)
        }));
    }
};

module.exports = DashboardService;
