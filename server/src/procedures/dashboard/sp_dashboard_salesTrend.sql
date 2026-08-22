DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_salesTrend`$$

-- Sales trend, bucketed by p_Granularity ('HOURLY'|'DAILY'|'WEEKLY'|'MONTHLY'). Two subqueries
-- (sales-level aggregates, sale_items-level aggregates) are joined on the period label rather
-- than joining sale_items directly to sales, which would fan out SubTotal/Discount and inflate
-- GrossSales once per line item.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_salesTrend`(
    IN p_StartDate DATETIME,
    IN p_EndDate DATETIME,
    IN p_BranchId INT,
    IN p_Granularity VARCHAR(10)
)
BEGIN
    DECLARE v_Format VARCHAR(20);

    SET v_Format = CASE p_Granularity
        WHEN 'HOURLY' THEN '%Y-%m-%d %H:00'
        WHEN 'WEEKLY' THEN '%x-W%v'
        WHEN 'MONTHLY' THEN '%Y-%m'
        ELSE '%Y-%m-%d'
    END;

    SELECT
        agg.PeriodLabel,
        agg.PeriodStart,
        agg.GrossSales,
        agg.TotalDiscounts,
        agg.Transactions,
        COALESCE(items.ItemsSold, 0) AS ItemsSold
    FROM (
        SELECT
            DATE_FORMAT(s.CreatedAt, v_Format) AS PeriodLabel,
            MIN(s.CreatedAt) AS PeriodStart,
            COALESCE(SUM(s.SubTotal), 0) AS GrossSales,
            COALESCE(SUM(s.Discount), 0) AS TotalDiscounts,
            COUNT(*) AS Transactions
        FROM sales s
        WHERE s.IsCancelled = 0 AND s.IsDeleted = 0
          AND s.CreatedAt BETWEEN p_StartDate AND p_EndDate
          AND (p_BranchId IS NULL OR s.BranchId = p_BranchId)
        GROUP BY PeriodLabel
    ) agg
    LEFT JOIN (
        SELECT
            DATE_FORMAT(s2.CreatedAt, v_Format) AS PeriodLabel,
            SUM(si.Quantity) AS ItemsSold
        FROM sale_items si
        INNER JOIN sales s2 ON s2.SaleId = si.SaleId
        WHERE si.IsDeleted = 0
          AND s2.IsCancelled = 0 AND s2.IsDeleted = 0
          AND s2.CreatedAt BETWEEN p_StartDate AND p_EndDate
          AND (p_BranchId IS NULL OR s2.BranchId = p_BranchId)
        GROUP BY PeriodLabel
    ) items ON items.PeriodLabel = agg.PeriodLabel
    ORDER BY agg.PeriodStart;
END$$

DELIMITER ;
