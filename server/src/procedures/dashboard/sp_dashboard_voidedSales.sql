DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_voidedSales`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_voidedSales`(
    IN p_StartDate DATETIME,
    IN p_EndDate DATETIME,
    IN p_BranchId INT
)
BEGIN
    SELECT
        s.SaleId,
        s.ORNo,
        CONCAT(e.FirstName, ' ', e.LastName) AS CashierName,
        s.BranchId,
        b.Description AS BranchName,
        t.Name AS TerminalName,
        s.Total,
        s.CancelReason,
        s.DateCancelled
    FROM sales s
    INNER JOIN branches b ON b.BranchId = s.BranchId
    INNER JOIN terminals t ON t.TerminalId = s.TerminalId
    LEFT JOIN users u ON u.UserId = s.CashierId
    LEFT JOIN employees e ON e.EmployeeId = u.EmployeeId
    WHERE s.IsCancelled = 1 AND s.IsDeleted = 0
      AND s.CreatedAt BETWEEN p_StartDate AND p_EndDate
      AND (p_BranchId IS NULL OR s.BranchId = p_BranchId)
    ORDER BY s.DateCancelled DESC;
END$$

DELIMITER ;
