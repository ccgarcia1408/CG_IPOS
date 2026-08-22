DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_official_receipt_assignments_getActiveByUserId`$$

-- The cashier's current usable OR range: most recently assigned, not yet exhausted
-- (LastORUsed < ORTo, or nothing issued from it yet). Lets the POS UI confirm up front that a
-- cashier has OR numbers available before they build a cart, and tells them how many remain.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_official_receipt_assignments_getActiveByUserId`(IN p_UserId INT)
BEGIN
    SELECT
        ora.ORAssignmentId,
        ora.ORFrom,
        ora.ORTo,
        ora.LastORUsed,
        (CAST(ora.ORTo AS UNSIGNED) - IFNULL(CAST(ora.LastORUsed AS UNSIGNED), CAST(ora.ORFrom AS UNSIGNED) - 1)) AS RemainingCount
    FROM official_receipt_assignments ora
    WHERE ora.UserId = p_UserId
      AND ora.IsDeleted = 0
      AND (ora.LastORUsed IS NULL OR CAST(ora.LastORUsed AS UNSIGNED) < CAST(ora.ORTo AS UNSIGNED))
    ORDER BY ora.CreatedAt DESC
    LIMIT 1;
END$$

DELIMITER ;
