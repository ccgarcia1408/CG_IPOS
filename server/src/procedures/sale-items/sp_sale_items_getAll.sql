DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_sale_items_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_sale_items_getAll`()
BEGIN
    SELECT
	si.SaleItemId,
	si.ProductId,
	si.Quantity,
	si.Price,
	si.Discount,
	si.Total,
	si.DeletedBy,
	si.DateDeleted,
	si.CreatedAt,
	si.CreatedBy,
	si.UpdatedAt,
	si.UpdatedBy
    FROM sale_items si
    WHERE si.IsDeleted = 0
    ;
END$$

DELIMITER ;