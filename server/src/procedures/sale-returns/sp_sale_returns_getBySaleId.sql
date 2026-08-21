DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_sale_returns_getBySaleId`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_sale_returns_getBySaleId`(IN p_SaleId INT)
BEGIN
    SELECT
        sr.SaleReturnId,
        sr.SaleId,
        sr.SaleItemId,
        sr.ProductId,
        p.Name AS ProductName,
        sr.QuantityReturned,
        sr.RefundAmount,
        sr.Reason,
        sr.CreatedAt,
        sr.CreatedBy
    FROM sale_returns sr
    INNER JOIN products p ON p.ProductId = sr.ProductId
    WHERE sr.SaleId = p_SaleId
    ORDER BY sr.CreatedAt DESC;
END$$

DELIMITER ;
