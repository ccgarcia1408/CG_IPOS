DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_shiftClosingSummary`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_shiftClosingSummary`(
    IN p_StartDate DATETIME,
    IN p_EndDate DATETIME,
    IN p_BranchId INT
)
BEGIN
    SELECT
        cs.CashierShiftId,
        CONCAT(e.FirstName, ' ', e.LastName) AS CashierName,
        cs.TerminalId,
        t.Name AS TerminalName,
        cs.BranchId,
        b.Description AS BranchName,
        cs.OpeningCash,
        cs.ExpectedCash,
        cs.ClosingCash AS ActualCash,
        cs.Variance,
        cs.OpenedAt,
        cs.ClosedAt
    FROM cashier_shifts cs
    INNER JOIN users u ON u.UserId = cs.CashierId
    INNER JOIN employees e ON e.EmployeeId = u.EmployeeId
    INNER JOIN branches b ON b.BranchId = cs.BranchId
    INNER JOIN terminals t ON t.TerminalId = cs.TerminalId
    WHERE cs.Status = 'CLOSED'
      AND cs.IsDeleted = 0
      AND cs.ClosedAt BETWEEN p_StartDate AND p_EndDate
      AND (p_BranchId IS NULL OR cs.BranchId = p_BranchId)
    ORDER BY cs.ClosedAt DESC;
END$$

DELIMITER ;
