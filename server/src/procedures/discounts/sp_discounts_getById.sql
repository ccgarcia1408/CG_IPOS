DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_discounts_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_discounts_getById`(IN p_DiscountId INT)
BEGIN
    SELECT
        d.DiscountId, d.Name, d.Description, d.`Type`, d.Value,
        d.IsDeleted, d.DeletedBy, d.DateDeleted,
        d.CreatedAt, d.CreatedBy, d.UpdatedAt, d.UpdatedBy, d.IsActive
    FROM discounts d
    WHERE d.DiscountId = p_DiscountId AND d.IsDeleted = 0
    LIMIT 1;
END$$

DELIMITER ;
