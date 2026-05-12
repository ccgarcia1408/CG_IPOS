DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_official_receipt_assignments_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_official_receipt_assignments_getAll`()
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
    WHERE ora.IsDeleted = 0
    ;
END$$

DELIMITER ;