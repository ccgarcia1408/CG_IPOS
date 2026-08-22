const DashboardModel = require("../models/dashboard.model");
const ApiError = require("../utils/ApiError");

const VALID_GRANULARITIES = new Set(["HOURLY", "DAILY", "WEEKLY", "MONTHLY"]);
const VALID_SORT_BY = new Set(["QUANTITY", "REVENUE"]);
const DEFAULT_TOP_N = 10;
const MAX_TOP_N = 50;
const DEFAULT_EXPIRING_DAYS = 30;
const VALID_EXPIRING_THRESHOLDS = new Set([7, 15, 30]);

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

function parseExpiringDays(value) {
    if (!value) return DEFAULT_EXPIRING_DAYS;

    const days = Number(value);

    if (!VALID_EXPIRING_THRESHOLDS.has(days)) {
        throw new ApiError(400, "ExpiringDays/ThresholdDays must be 7, 15, or 30.");
    }

    return days;
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
    },

    async getSalesByPaymentMethod(query, scope) {
        const { start, end } = parseDateRange(query.StartDate, query.EndDate);
        const branchId = resolveBranchId(query.BranchId, scope);

        const rows = await DashboardModel.getSalesByPaymentMethod(start, end, branchId);
        const total = rows.reduce((sum, row) => sum + Number(row.TotalAmount), 0);

        return rows.map((row) => ({
            PaymentMethodId: row.PaymentMethodId,
            PaymentMethodName: row.PaymentMethodName,
            TotalAmount: Number(row.TotalAmount),
            TransactionCount: Number(row.TransactionCount),
            PercentageOfTotal: total > 0 ? Number(((Number(row.TotalAmount) / total) * 100).toFixed(2)) : 0
        }));
    },

    async getSalesByBranch(query, scope) {
        const { start, end } = parseDateRange(query.StartDate, query.EndDate);
        const branchId = resolveBranchId(query.BranchId, scope);

        const rows = await DashboardModel.getSalesByBranch(start, end, branchId);

        return rows.map((row) => {
            const sales = Number(row.Sales);
            const transactions = Number(row.Transactions);

            return {
                BranchId: row.BranchId,
                BranchName: row.BranchName,
                Sales: sales,
                Transactions: transactions,
                ItemsSold: Number(row.ItemsSold),
                AverageTransactionValue: transactions > 0 ? Number((sales / transactions).toFixed(2)) : 0
            };
        });
    },

    async getSalesByTerminal(query, scope) {
        const { start, end } = parseDateRange(query.StartDate, query.EndDate);
        const branchId = resolveBranchId(query.BranchId, scope);

        const rows = await DashboardModel.getSalesByTerminal(start, end, branchId);

        return rows.map((row) => {
            const sales = Number(row.Sales);
            const transactions = Number(row.Transactions);

            return {
                TerminalId: row.TerminalId,
                TerminalName: row.TerminalName,
                BranchId: row.BranchId,
                BranchName: row.BranchName,
                Sales: sales,
                Transactions: transactions,
                ItemsSold: Number(row.ItemsSold),
                AverageTransactionValue: transactions > 0 ? Number((sales / transactions).toFixed(2)) : 0
            };
        });
    },

    async getTopProducts(query, scope) {
        const { start, end } = parseDateRange(query.StartDate, query.EndDate);
        const branchId = resolveBranchId(query.BranchId, scope);
        const sortBy = (query.SortBy || "REVENUE").toUpperCase();
        const limit = Math.min(Number(query.Limit) || DEFAULT_TOP_N, MAX_TOP_N);

        if (!VALID_SORT_BY.has(sortBy)) {
            throw new ApiError(400, "SortBy must be QUANTITY or REVENUE.");
        }

        const rows = await DashboardModel.getTopProducts(start, end, branchId, sortBy);
        const totalQuantity = rows.reduce((sum, row) => sum + Number(row.QuantitySold), 0);
        const totalRevenue = rows.reduce((sum, row) => sum + Number(row.SalesAmount), 0);
        const base = sortBy === "QUANTITY" ? totalQuantity : totalRevenue;

        return rows.slice(0, limit).map((row, index) => {
            const quantitySold = Number(row.QuantitySold);
            const salesAmount = Number(row.SalesAmount);
            const value = sortBy === "QUANTITY" ? quantitySold : salesAmount;

            return {
                Rank: index + 1,
                ProductId: row.ProductId,
                ProductName: row.ProductName,
                SKU: row.SKU,
                CategoryName: row.CategoryName,
                QuantitySold: quantitySold,
                SalesAmount: salesAmount,
                PercentageOfSales: base > 0 ? Number(((value / base) * 100).toFixed(2)) : 0
            };
        });
    },

    async getTopCategories(query, scope) {
        const { start, end } = parseDateRange(query.StartDate, query.EndDate);
        const branchId = resolveBranchId(query.BranchId, scope);

        const rows = await DashboardModel.getTopCategories(start, end, branchId);
        const totalSales = rows.reduce((sum, row) => sum + Number(row.Sales), 0);

        return rows.map((row) => ({
            CategoryId: row.CategoryId,
            CategoryName: row.CategoryName,
            QuantitySold: Number(row.QuantitySold),
            Sales: Number(row.Sales),
            PercentageOfSales: totalSales > 0 ? Number(((Number(row.Sales) / totalSales) * 100).toFixed(2)) : 0
        }));
    },

    async getInventorySummary(query, scope) {
        const branchId = resolveBranchId(query.BranchId, scope);
        const expiringDays = parseExpiringDays(query.ExpiringDays);

        const row = await DashboardModel.getInventorySummary(branchId, expiringDays);

        return {
            BranchId: branchId,
            TotalActiveProducts: Number(row.TotalActiveProducts),
            TotalInventoryUnits: Number(row.TotalInventoryUnits),
            TotalInventoryValue: Number(row.TotalInventoryValue),
            LowStockCount: Number(row.LowStockCount),
            OutOfStockCount: Number(row.OutOfStockCount),
            ExpiringSoonCount: Number(row.ExpiringSoonCount)
        };
    },

    async getLowStockAlerts(query, scope) {
        const branchId = resolveBranchId(query.BranchId, scope);
        const rows = await DashboardModel.getLowStockAlerts(branchId);

        return rows.map((row) => ({
            ProductId: row.ProductId,
            ProductName: row.ProductName,
            SKU: row.SKU,
            BranchId: row.BranchId,
            BranchName: row.BranchName,
            CurrentStock: Number(row.CurrentStock),
            MinimumStock: Number(row.MinimumStock),
            StockDifference: Number(row.StockDifference)
        }));
    },

    async getOutOfStockAlerts(query, scope) {
        const branchId = resolveBranchId(query.BranchId, scope);
        return await DashboardModel.getOutOfStockAlerts(branchId);
    },

    async getExpiringProducts(query, scope) {
        const branchId = resolveBranchId(query.BranchId, scope);
        const thresholdDays = parseExpiringDays(query.ThresholdDays);

        const rows = await DashboardModel.getExpiringProducts(branchId, thresholdDays);

        return rows.map((row) => ({
            ProductId: row.ProductId,
            ProductName: row.ProductName,
            SKU: row.SKU,
            BranchId: row.BranchId,
            BranchName: row.BranchName,
            Quantity: Number(row.Quantity),
            ExpiryDate: row.ExpiryDate,
            DaysRemaining: Number(row.DaysRemaining)
        }));
    },

    async getPurchasingSummary(query, scope) {
        const { start, end } = parseDateRange(query.StartDate, query.EndDate);
        const branchId = resolveBranchId(query.BranchId, scope);

        const row = await DashboardModel.getPurchasingSummary(start, end, branchId);

        return {
            BranchId: branchId,
            TotalPurchases: Number(row.TotalPurchases),
            PurchaseAmount: Number(row.PurchaseAmount),
            PendingCount: Number(row.PendingCount),
            PendingAmount: Number(row.PendingAmount),
            ReceivedCount: Number(row.ReceivedCount),
            ReceivedAmount: Number(row.ReceivedAmount),
            CancelledCount: Number(row.CancelledCount),
            CancelledAmount: Number(row.CancelledAmount)
        };
    },

    async getPendingPurchases(query, scope) {
        const branchId = resolveBranchId(query.BranchId, scope);
        const rows = await DashboardModel.getPendingPurchases(branchId);

        return rows.map((row) => ({
            PurchaseId: row.PurchaseId,
            SupplierName: row.SupplierName,
            BranchId: row.BranchId,
            BranchName: row.BranchName,
            PurchaseDate: row.PurchaseDate,
            TotalAmount: Number(row.TotalAmount),
            Status: row.Status
        }));
    },

    async getSupplierSummary(query, scope) {
        const { start, end } = parseDateRange(query.StartDate, query.EndDate);
        const branchId = resolveBranchId(query.BranchId, scope);

        const rows = await DashboardModel.getSupplierSummary(start, end, branchId);

        return rows.map((row) => ({
            SupplierId: row.SupplierId,
            SupplierName: row.SupplierName,
            PurchaseCount: Number(row.PurchaseCount),
            TotalAmount: Number(row.TotalAmount)
        }));
    },

    async getCashierPerformance(query, scope) {
        const { start, end } = parseDateRange(query.StartDate, query.EndDate);
        const branchId = resolveBranchId(query.BranchId, scope);

        const rows = await DashboardModel.getCashierPerformance(start, end, branchId);

        return rows.map((row) => {
            const sales = Number(row.Sales);
            const transactions = Number(row.Transactions);

            return {
                CashierId: row.CashierId,
                CashierName: row.CashierName,
                BranchId: row.BranchId,
                BranchName: row.BranchName,
                Transactions: transactions,
                Sales: sales,
                ItemsSold: Number(row.ItemsSold),
                AverageTransactionValue: transactions > 0 ? Number((sales / transactions).toFixed(2)) : 0
            };
        });
    },

    async getVoidedSales(query, scope) {
        const { start, end } = parseDateRange(query.StartDate, query.EndDate);
        const branchId = resolveBranchId(query.BranchId, scope);

        const rows = await DashboardModel.getVoidedSales(start, end, branchId);

        return rows.map((row) => ({
            SaleId: row.SaleId,
            ORNo: row.ORNo,
            CashierName: row.CashierName,
            BranchId: row.BranchId,
            BranchName: row.BranchName,
            TerminalName: row.TerminalName,
            Total: Number(row.Total),
            CancelReason: row.CancelReason,
            DateCancelled: row.DateCancelled
        }));
    },

    async getStockAdjustmentSummary(query, scope) {
        const { start, end } = parseDateRange(query.StartDate, query.EndDate);
        const branchId = resolveBranchId(query.BranchId, scope);

        const row = await DashboardModel.getStockAdjustmentSummary(start, end, branchId);

        return {
            BranchId: branchId,
            AdjustmentCount: Number(row.AdjustmentCount),
            StockAdded: Number(row.StockAdded),
            StockRemoved: Number(row.StockRemoved)
        };
    },

    async getRecentStockAdjustments(query, scope) {
        const { start, end } = parseDateRange(query.StartDate, query.EndDate);
        const branchId = resolveBranchId(query.BranchId, scope);
        const limit = Math.min(Number(query.Limit) || DEFAULT_TOP_N, MAX_TOP_N);

        const rows = await DashboardModel.getRecentStockAdjustments(start, end, branchId, limit);

        return rows.map((row) => ({
            InventoryLogId: row.InventoryLogId,
            CreatedAt: row.CreatedAt,
            ProductName: row.ProductName,
            BranchId: row.BranchId,
            BranchName: row.BranchName,
            Quantity: Number(row.Quantity),
            Reason: row.Reason,
            UserName: row.UserName
        }));
    }
};

module.exports = DashboardService;
