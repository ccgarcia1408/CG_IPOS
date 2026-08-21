DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_discounts_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_discounts_getAll`()
BEGIN
    SELECT
        d.DiscountId, d.Name, d.Description, d.`Type`, d.Value,
        d.IsDeleted, d.DeletedBy, d.DateDeleted,
        d.CreatedAt, d.CreatedBy, d.UpdatedAt, d.UpdatedBy, d.IsActive
    FROM discounts d
    WHERE d.IsDeleted = 0
    ORDER BY d.Name;
END$$

DELIMITER ;
