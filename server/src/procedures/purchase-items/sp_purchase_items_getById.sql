DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_purchase_items_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_purchase_items_getById`(
    IN p_PurchaseItemId INT
)
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
    WHERE pui.PurchaseItemId = p_PurchaseItemId
    AND pui.IsDeleted = 0
    LIMIT 1;

END$$

DELIMITER ;