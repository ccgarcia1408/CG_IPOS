DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_lowStockAlerts`$$

-- Quantity > 0 AND Quantity <= MinimumStock (strictly out-of-stock products are a separate
-- alert -- sp_dashboard_outOfStockAlerts -- so they aren't double-counted here).
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_lowStockAlerts`(
    IN p_BranchId INT
)
BEGIN
    SELECT
        p.ProductId,
        p.Name AS ProductName,
        p.SKU,
        i.BranchId,
        b.Description AS BranchName,
        i.Quantity AS CurrentStock,
        i.MinimumStock,
        (i.MinimumStock - i.Quantity) AS StockDifference
    FROM inventories i
    INNER JOIN products p ON p.ProductId = i.ProductId
    INNER JOIN branches b ON b.BranchId = i.BranchId
    WHERE p.IsDeleted = 0 AND p.IsActive = 1
      AND i.Quantity > 0
      AND i.Quantity <= i.MinimumStock
      AND (p_BranchId IS NULL OR i.BranchId = p_BranchId)
    ORDER BY StockDifference DESC;
END$$

DELIMITER ;
