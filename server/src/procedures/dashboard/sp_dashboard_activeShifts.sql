DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_activeShifts`$$

-- Live snapshot of currently open shifts. CurrentSales/CurrentCashPayments are running totals
-- computed the same way sp_cashier_shifts_close computes ExpectedCash, but live (no closing
-- entry yet) -- CurrentCashPayments is the cash-only subset of CurrentSales.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_activeShifts`(
    IN p_BranchId INT
)
BEGIN
    SELECT
        cs.CashierShiftId,
        cs.CashierId,
        CONCAT(e.FirstName, ' ', e.LastName) AS CashierName,
        cs.BranchId,
        b.Description AS BranchName,
        cs.TerminalId,
        t.Name AS TerminalName,
        cs.OpeningCash,
        cs.OpenedAt,
        COALESCE((
            SELECT SUM(s.Total) FROM sales s
            WHERE s.CashierId = cs.CashierId AND s.TerminalId = cs.TerminalId
              AND s.IsCancelled = 0 AND s.IsDeleted = 0 AND s.CreatedAt >= cs.OpenedAt
        ), 0) AS CurrentSales,
        COALESCE((
            SELECT SUM(s.Total) FROM sales s
            INNER JOIN payment_methods pm ON pm.PaymentMethodId = s.PaymentMethodId
            WHERE s.CashierId = cs.CashierId AND s.TerminalId = cs.TerminalId
              AND s.IsCancelled = 0 AND s.IsDeleted = 0 AND s.CreatedAt >= cs.OpenedAt
              AND pm.IsCash = 1
        ), 0) AS CurrentCashPayments
    FROM cashier_shifts cs
    INNER JOIN users u ON u.UserId = cs.CashierId
    INNER JOIN employees e ON e.EmployeeId = u.EmployeeId
    INNER JOIN branches b ON b.BranchId = cs.BranchId
    INNER JOIN terminals t ON t.TerminalId = cs.TerminalId
    WHERE cs.Status = 'OPEN'
      AND cs.IsDeleted = 0
      AND (p_BranchId IS NULL OR cs.BranchId = p_BranchId)
    ORDER BY cs.OpenedAt ASC;
END$$

DELIMITER ;
