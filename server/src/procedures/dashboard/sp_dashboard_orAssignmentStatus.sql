DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_orAssignmentStatus`$$

-- OR assignments are per-cashier (UserId), not per-branch, in this schema -- no branch filter
-- applies here. Remaining = ORTo - LastORUsed, or the full range width if nothing's been used
-- yet.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_orAssignmentStatus`()
BEGIN
    SELECT
        ora.ORAssignmentId,
        ora.UserId,
        CONCAT(e.FirstName, ' ', e.LastName) AS CashierName,
        ora.ORFrom,
        ora.ORTo,
        ora.LastORUsed,
        (CAST(ora.ORTo AS UNSIGNED) - IFNULL(CAST(ora.LastORUsed AS UNSIGNED), CAST(ora.ORFrom AS UNSIGNED) - 1)) AS RemainingCount
    FROM official_receipt_assignments ora
    INNER JOIN users u ON u.UserId = ora.UserId
    INNER JOIN employees e ON e.EmployeeId = u.EmployeeId
    WHERE ora.IsDeleted = 0
    ORDER BY RemainingCount ASC;
END$$

DELIMITER ;
