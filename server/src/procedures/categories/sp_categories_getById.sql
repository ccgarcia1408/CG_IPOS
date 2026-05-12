DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_categories_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_categories_getById`(
    IN p_CategoryId INT
)
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
    WHERE c.CategoryId = p_CategoryId
    AND c.IsDeleted = 0
    LIMIT 1;

END$$

DELIMITER ;