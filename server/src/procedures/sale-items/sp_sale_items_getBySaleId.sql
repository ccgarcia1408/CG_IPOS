DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_sale_items_getBySaleId`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_sale_items_getBySaleId`(IN p_SaleId INT)
BEGIN
    SELECT
        si.SaleItemId,
        si.SaleId,
        si.ProductId,
        p.Name AS ProductName,
        p.SKU,
        p.Barcode,
        si.Quantity,
        si.Price,
        si.Discount,
        si.Total,
        IFNULL((SELECT SUM(sr.QuantityReturned) FROM sale_returns sr WHERE sr.SaleItemId = si.SaleItemId), 0) AS QuantityReturned,
        si.CreatedAt
    FROM sale_items si
    INNER JOIN products p ON p.ProductId = si.ProductId
    WHERE si.SaleId = p_SaleId
      AND si.IsDeleted = 0
    ORDER BY si.SaleItemId;
END$$

DELIMITER ;
