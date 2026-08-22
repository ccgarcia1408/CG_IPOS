DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_discounts_getAllActive`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_discounts_getAllActive`()
BEGIN
    SELECT
        d.DiscountId, d.Name, d.Description, d.`Type`, d.Value
    FROM discounts d
    WHERE d.IsDeleted = 0 AND d.IsActive = 1
    ORDER BY d.Name;
END$$

DELIMITER ;
