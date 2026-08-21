DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_purchase_items_getByPurchaseId`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_purchase_items_getByPurchaseId`(IN p_PurchaseId INT)
BEGIN
    SELECT
        pi.PurchaseItemId,
        pi.PurchaseId,
        pi.ProductId,
        pr.Name AS ProductName,
        pr.SKU,
        pr.Barcode,
        pi.Quantity,
        pi.CostPrice,
        pi.Total,
        pi.CreatedAt
    FROM purchase_items pi
    INNER JOIN products pr ON pr.ProductId = pi.ProductId
    WHERE pi.PurchaseId = p_PurchaseId
      AND pi.IsDeleted = 0
    ORDER BY pi.PurchaseItemId;
END$$

DELIMITER ;
