DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_cashier_shifts_getMyOpenShift`$$

-- Used by POS.tsx to determine whether the current cashier already has an open shift (and if
-- so, its details) before showing "Open Shift" vs "Close Shift".
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_cashier_shifts_getMyOpenShift`(
    IN p_CashierId INT
)
BEGIN
    SELECT
        cs.CashierShiftId,
        cs.BranchId,
        b.Description AS BranchName,
        cs.TerminalId,
        t.Name AS TerminalName,
        cs.OpeningCash,
        cs.OpenedAt
    FROM cashier_shifts cs
    INNER JOIN branches b ON b.BranchId = cs.BranchId
    INNER JOIN terminals t ON t.TerminalId = cs.TerminalId
    WHERE cs.CashierId = p_CashierId
      AND cs.Status = 'OPEN'
      AND cs.IsDeleted = 0
    LIMIT 1;
END$$

DELIMITER ;
