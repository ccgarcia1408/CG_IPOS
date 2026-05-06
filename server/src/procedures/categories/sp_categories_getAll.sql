DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_categories_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_categories_getAll`()
BEGIN
    SELECT
	c.BranchId,
	c.Name,
	c.Description,
	c.IsDeleted,
	c.DeletedBy,
	c.DateDeleted,
	c.CreatedAt,
	c.CreatedBy,
	c.UpdatedAt,
	c.UpdatedBy,
	c.IsActive
    FROM categories c
    WHERE c.IsDeleted = 0
    ;
END$$

DELIMITER ;