DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_categories_getAllActive`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_categories_getAllActive`()
BEGIN
    SELECT
	c.CategoryId,
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
    AND c.IsActive = 1
    ;
END$$

DELIMITER ;
