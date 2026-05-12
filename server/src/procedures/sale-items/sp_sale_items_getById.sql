DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_sale_items_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_sale_items_getById`(
    IN p_SaleItemId INT
)
BEGIN

    SELECT
        si.SaleItemId,
        si.ProductId,
        si.Quantity,
        si.Price,
        si.Discount,
        si.Total,
        si.IsDeleted,
        si.DeletedBy,
        si.DateDeleted,
        si.CreatedAt,
        si.CreatedBy,
        si.UpdatedAt,
        si.UpdatedBy
    FROM sale_items si
    WHERE si.SaleItemId = p_SaleItemId
    AND si.IsDeleted = 0
    LIMIT 1;

END$$

DELIMITER ;