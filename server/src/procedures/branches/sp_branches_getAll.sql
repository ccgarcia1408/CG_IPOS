DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_branches_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_branches_getAll`()
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
    ;
END$$

DELIMITER ;