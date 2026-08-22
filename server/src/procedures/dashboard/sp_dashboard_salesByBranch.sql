DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_salesByBranch`$$

-- p_BranchId narrows to one branch (matching this codebase's other dashboard SPs); pass NULL
-- for the full multi-branch breakdown Admin sees. ItemsSold is joined via a separate
-- per-branch subquery rather than joining sale_items directly, to avoid fanning out Sales/
-- SubTotal once per line item.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_salesByBranch`(
    IN p_StartDate DATETIME,
    IN p_EndDate DATETIME,
    IN p_BranchId INT
)
BEGIN
    SELECT
        b.BranchId,
        b.Description AS BranchName,
        COALESCE(SUM(s.SubTotal), 0) AS Sales,
        COUNT(s.SaleId) AS Transactions,
        COALESCE((
            SELECT SUM(si.Quantity)
            FROM sale_items si
            INNER JOIN sales s2 ON s2.SaleId = si.SaleId
            WHERE si.IsDeleted = 0
              AND s2.IsCancelled = 0 AND s2.IsDeleted = 0
              AND s2.BranchId = b.BranchId
              AND s2.CreatedAt BETWEEN p_StartDate AND p_EndDate
        ), 0) AS ItemsSold
    FROM branches b
    LEFT JOIN sales s ON s.BranchId = b.BranchId
        AND s.IsCancelled = 0 AND s.IsDeleted = 0
        AND s.CreatedAt BETWEEN p_StartDate AND p_EndDate
    WHERE b.IsDeleted = 0
      AND (p_BranchId IS NULL OR b.BranchId = p_BranchId)
    GROUP BY b.BranchId, b.Description
    ORDER BY Sales DESC;
END$$

DELIMITER ;
