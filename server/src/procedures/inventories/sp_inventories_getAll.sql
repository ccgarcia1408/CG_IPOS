DELIMITER $$
USE `cg_ipos_db`$$
DROP PROCEDURE IF EXISTS `sp_inventories_getAll`$$
CREATE PROCEDURE `sp_inventories_getAll`(IN p_BranchId INT)
BEGIN
    SELECT i.InventoryId, i.BranchId, i.ProductId, i.Quantity, i.MinimumStock, i.CreatedAt, i.UpdatedAt, p.Name AS ProductName, p.Barcode, p.SKU, p.IsActive AS ProductIsActive, b.Name AS BranchName, b.Description AS BranchDescription
    FROM inventories i INNER JOIN products p ON p.ProductId = i.ProductId AND p.IsDeleted = 0 INNER JOIN branches b ON b.BranchId = i.BranchId AND b.IsDeleted = 0
    WHERE p_BranchId IS NULL OR i.BranchId = p_BranchId ORDER BY b.Name, p.Name;
END$$
DELIMITER ;
