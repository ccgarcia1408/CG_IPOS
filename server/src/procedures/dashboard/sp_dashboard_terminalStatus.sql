DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_terminalStatus`$$

-- Now buildable for real (previously flagged as a gap): a terminal is 'Open' if it has an
-- active cashier_shifts row, else 'Closed'. No 'Offline' state exists -- that would need a
-- heartbeat/session-liveness signal this system doesn't have, so it's not fabricated here.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_terminalStatus`(
    IN p_BranchId INT
)
BEGIN
    SELECT
        t.TerminalId,
        t.Name AS TerminalName,
        t.BranchId,
        b.Description AS BranchName,
        CASE WHEN cs.CashierShiftId IS NOT NULL THEN 'Open' ELSE 'Closed' END AS Status,
        cs.CashierId AS CurrentCashierId,
        CONCAT(e.FirstName, ' ', e.LastName) AS CurrentCashierName,
        cs.OpenedAt AS ShiftOpenedAt
    FROM terminals t
    INNER JOIN branches b ON b.BranchId = t.BranchId
    LEFT JOIN cashier_shifts cs ON cs.TerminalId = t.TerminalId AND cs.Status = 'OPEN' AND cs.IsDeleted = 0
    LEFT JOIN users u ON u.UserId = cs.CashierId
    LEFT JOIN employees e ON e.EmployeeId = u.EmployeeId
    WHERE t.IsDeleted = 0 AND t.IsActive = 1
      AND (p_BranchId IS NULL OR t.BranchId = p_BranchId)
    ORDER BY b.Description, t.Name;
END$$

DELIMITER ;
