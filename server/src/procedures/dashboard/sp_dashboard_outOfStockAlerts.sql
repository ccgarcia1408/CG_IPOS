DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_dashboard_outOfStockAlerts`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dashboard_outOfStockAlerts`(
    IN p_BranchId INT
)
BEGIN
    SELECT
        p.ProductId,
        p.Name AS ProductName,
        p.SKU,
        i.BranchId,
        b.Description AS BranchName
    FROM inventories i
    INNER JOIN products p ON p.ProductId = i.ProductId
    INNER JOIN branches b ON b.BranchId = i.BranchId
    WHERE p.IsDeleted = 0 AND p.IsActive = 1
      AND i.Quantity = 0
      AND (p_BranchId IS NULL OR i.BranchId = p_BranchId)
    ORDER BY p.Name;
END$$

DELIMITER ;
