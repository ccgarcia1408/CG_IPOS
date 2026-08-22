DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_recentSales`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_recentSales`(
    IN p_StartDate DATETIME,
    IN p_EndDate DATETIME,
    IN p_BranchId INT,
    IN p_Limit INT
)
BEGIN
    SELECT
        s.SaleId,
        s.ORNo,
        s.CreatedAt,
        s.BranchId,
        b.Description AS BranchName,
        t.Name AS TerminalName,
        CONCAT(e.FirstName, ' ', e.LastName) AS CashierName,
        s.Total,
        pm.Name AS PaymentMethodName,
        CASE WHEN s.IsCancelled = 1 THEN 'Voided' ELSE 'Completed' END AS Status
    FROM sales s
    INNER JOIN branches b ON b.BranchId = s.BranchId
    INNER JOIN terminals t ON t.TerminalId = s.TerminalId
    LEFT JOIN users u ON u.UserId = s.CashierId
    LEFT JOIN employees e ON e.EmployeeId = u.EmployeeId
    LEFT JOIN payment_methods pm ON pm.PaymentMethodId = s.PaymentMethodId
    WHERE s.IsDeleted = 0
      AND s.CreatedAt BETWEEN p_StartDate AND p_EndDate
      AND (p_BranchId IS NULL OR s.BranchId = p_BranchId)
    ORDER BY s.CreatedAt DESC
    LIMIT p_Limit;
END$$

DELIMITER ;
