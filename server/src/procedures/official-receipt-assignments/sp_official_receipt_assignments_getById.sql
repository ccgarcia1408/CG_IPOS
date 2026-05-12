DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_official_receipt_assignments_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_official_receipt_assignments_getById`(
    IN p_ORAssignmentId INT
)
BEGIN

    SELECT
        ora.ORAssignmentId,
        ora.ORFrom,
        ora.ORTo,
        ora.LastORUsed,
        ora.UserId,
        ora.IsDeleted,
        ora.DeletedBy,
        ora.DateDeleted,
        ora.CreatedAt,
        ora.CreatedBy,
        ora.UpdatedAt,
        ora.UpdatedBy
    FROM official_receipt_assignments ora
    WHERE ora.ORAssignmentId = p_ORAssignmentId
    AND ora.IsDeleted = 0
    LIMIT 1;

END$$

DELIMITER ;