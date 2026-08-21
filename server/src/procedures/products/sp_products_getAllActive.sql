DELIMITER $$
USE `cg_ipos_db`$$
DROP PROCEDURE IF EXISTS `sp_products_getAllActive`$$
CREATE PROCEDURE `sp_products_getAllActive`() BEGIN SELECT ProductId, CategoryId, Name, Description, Barcode, SKU, CostPrice, SellingPrice, ManufacturingDate, ExpiryDate, ImagePath, IsDeleted, DeletedBy, DateDeleted, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy, IsActive FROM products WHERE IsDeleted = 0 AND IsActive = 1; END$$
DELIMITER ;
