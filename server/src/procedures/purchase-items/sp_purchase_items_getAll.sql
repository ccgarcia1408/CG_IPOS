DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_purchase_items_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_purchase_items_getAll`()
BEGIN
    SELECT
	pui.PurchaseItemId,
	pui.ProductId,
	pui.Quantity,
	pui.CostPrice,
	pui.Total,
	pui.IsDeleted,
	pui.DeletedBy,
	pui.DateDeleted,
	pui.CreatedAt,
	pui.CreatedBy,
	pui.UpdatedAt,
	pui.UpdatedBy
    FROM purchase_items pui
    WHERE pui.IsDeleted = 0
    ;
END$$

DELIMITER ;