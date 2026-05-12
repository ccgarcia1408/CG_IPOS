DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_branches_getAllActive`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_branches_getAllActive`()
BEGIN
    SELECT
	b.BranchId,
	b.Name,
	b.Description,
	b.IsDeleted,
	b.DeletedBy,
	b.DateDeleted,
	b.CreatedAt,
	b.CreatedBy,
	b.UpdatedAt,
	b.UpdatedBy,
	b.IsActive
    FROM branches b
    WHERE b.IsDeleted = 0
    AND b.IsActive = 1
    ;
END$$

DELIMITER ;