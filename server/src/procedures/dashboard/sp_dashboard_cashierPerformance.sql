DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_cashierPerformance`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_cashierPerformance`(
    IN p_StartDate DATETIME,
    IN p_EndDate DATETIME,
    IN p_BranchId INT
)
BEGIN
    SELECT
        u.UserId AS CashierId,
        CONCAT(e.FirstName, ' ', e.LastName) AS CashierName,
        s.BranchId,
        b.Description AS BranchName,
        COUNT(s.SaleId) AS Transactions,
        COALESCE(SUM(s.SubTotal), 0) AS Sales,
        COALESCE((
            SELECT SUM(si.Quantity)
            FROM sale_items si
            INNER JOIN sales s2 ON s2.SaleId = si.SaleId
            WHERE si.IsDeleted = 0
              AND s2.CashierId = u.UserId
              AND s2.BranchId = s.BranchId
              AND s2.IsCancelled = 0 AND s2.IsDeleted = 0
              AND s2.CreatedAt BETWEEN p_StartDate AND p_EndDate
        ), 0) AS ItemsSold
    FROM sales s
    INNER JOIN users u ON u.UserId = s.CashierId
    INNER JOIN employees e ON e.EmployeeId = u.EmployeeId
    INNER JOIN branches b ON b.BranchId = s.BranchId
    WHERE s.IsCancelled = 0 AND s.IsDeleted = 0
      AND s.CreatedAt BETWEEN p_StartDate AND p_EndDate
      AND (p_BranchId IS NULL OR s.BranchId = p_BranchId)
    GROUP BY u.UserId, CashierName, s.BranchId, b.Description
    ORDER BY Sales DESC;
END$$

DELIMITER ;
