DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_inventorySummary`$$

-- Point-in-time snapshot (no date range -- inventory is "as of now", not a period metric).
-- InventoryValue = Quantity * CostPrice, per the ticket's own formula. p_ExpiringDays sets the
-- "expiring soon" threshold (e.g. 30).
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_inventorySummary`(
    IN p_BranchId INT,
    IN p_ExpiringDays INT
)
BEGIN
    SELECT
        (SELECT COUNT(*) FROM products WHERE IsDeleted = 0 AND IsActive = 1) AS TotalActiveProducts,
        COALESCE(SUM(i.Quantity), 0) AS TotalInventoryUnits,
        COALESCE(SUM(i.Quantity * p.CostPrice), 0) AS TotalInventoryValue,
        COALESCE(SUM(CASE WHEN i.Quantity > 0 AND i.Quantity <= i.MinimumStock THEN 1 ELSE 0 END), 0) AS LowStockCount,
        COALESCE(SUM(CASE WHEN i.Quantity = 0 THEN 1 ELSE 0 END), 0) AS OutOfStockCount,
        COALESCE((
            SELECT COUNT(DISTINCT p2.ProductId)
            FROM products p2
            INNER JOIN inventories i2 ON i2.ProductId = p2.ProductId
            WHERE p2.IsDeleted = 0 AND p2.IsActive = 1
              AND p2.ExpiryDate IS NOT NULL
              AND p2.ExpiryDate <= DATE_ADD(CURDATE(), INTERVAL p_ExpiringDays DAY)
              AND p2.ExpiryDate >= CURDATE()
              AND i2.Quantity > 0
              AND (p_BranchId IS NULL OR i2.BranchId = p_BranchId)
        ), 0) AS ExpiringSoonCount
    FROM inventories i
    INNER JOIN products p ON p.ProductId = i.ProductId
    WHERE p.IsDeleted = 0 AND p.IsActive = 1
      AND (p_BranchId IS NULL OR i.BranchId = p_BranchId);
END$$

DELIMITER ;
