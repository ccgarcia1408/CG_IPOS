DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_salesSummary`$$

-- Sales KPI aggregates for one period (the caller runs this twice -- current period and the
-- equal-length prior period -- to get the comparison shown on the dashboard; that arithmetic
-- lives in dashboard.service.js, not here).
--
-- Uses sales.CreatedAt (a full TIMESTAMP) rather than sales.Date (a plain DATE with no time
-- component -- confirmed via DESCRIBE sales) as the time dimension, since Date can't support
-- the ticket's hourly granularity requirement at all.
--
-- GrossSales/TotalDiscounts follow the ticket's own formula: "Gross Sales = sum of completed
-- sale amounts before deductions" -- i.e. SubTotal (which already has per-item discounts
-- baked in from checkout, but not the header-level Discount/Tax). NetSales = GrossSales -
-- TotalDiscounts - TotalReturns is computed by the caller; Tax is intentionally excluded from
-- both (pass-through, not revenue), matching the ticket's formula which never mentions tax.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_salesSummary`(
    IN p_StartDate DATETIME,
    IN p_EndDate DATETIME,
    IN p_BranchId INT
)
BEGIN
    SELECT
        COALESCE(SUM(s.SubTotal), 0) AS GrossSales,
        COALESCE(SUM(s.Discount), 0) AS TotalDiscounts,
        COUNT(*) AS CompletedTransactions,
        COALESCE((
            SELECT SUM(si.Quantity)
            FROM sale_items si
            INNER JOIN sales s2 ON s2.SaleId = si.SaleId
            WHERE si.IsDeleted = 0
              AND s2.IsCancelled = 0 AND s2.IsDeleted = 0
              AND s2.CreatedAt BETWEEN p_StartDate AND p_EndDate
              AND (p_BranchId IS NULL OR s2.BranchId = p_BranchId)
        ), 0) AS ItemsSold,
        COALESCE((
            SELECT SUM(sr.RefundAmount)
            FROM sale_returns sr
            WHERE sr.CreatedAt BETWEEN p_StartDate AND p_EndDate
              AND (p_BranchId IS NULL OR sr.BranchId = p_BranchId)
        ), 0) AS TotalReturns,
        COALESCE((
            SELECT COUNT(*)
            FROM sale_returns sr
            WHERE sr.CreatedAt BETWEEN p_StartDate AND p_EndDate
              AND (p_BranchId IS NULL OR sr.BranchId = p_BranchId)
        ), 0) AS ReturnsCount,
        COALESCE((
            SELECT SUM(sv.Total)
            FROM sales sv
            WHERE sv.IsCancelled = 1 AND sv.IsDeleted = 0
              AND sv.CreatedAt BETWEEN p_StartDate AND p_EndDate
              AND (p_BranchId IS NULL OR sv.BranchId = p_BranchId)
        ), 0) AS VoidedSales,
        COALESCE((
            SELECT COUNT(*)
            FROM sales sv
            WHERE sv.IsCancelled = 1 AND sv.IsDeleted = 0
              AND sv.CreatedAt BETWEEN p_StartDate AND p_EndDate
              AND (p_BranchId IS NULL OR sv.BranchId = p_BranchId)
        ), 0) AS VoidedCount
    FROM sales s
    WHERE s.IsCancelled = 0 AND s.IsDeleted = 0
      AND s.CreatedAt BETWEEN p_StartDate AND p_EndDate
      AND (p_BranchId IS NULL OR s.BranchId = p_BranchId);
END$$

DELIMITER ;
