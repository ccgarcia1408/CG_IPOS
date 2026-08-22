DELIMITER $$
USE `cg_ipos_db`$$
DROP PROCEDURE IF EXISTS `sp_products_getById`$$
CREATE PROCEDURE `sp_products_getById`(IN p_ProductId INT) BEGIN SELECT ProductId, CategoryId, Name, Description, Barcode, SKU, CostPrice, SellingPrice, ManufacturingDate, ExpiryDate, ImagePath, IsDeleted, DeletedBy, DateDeleted, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy, IsActive FROM products WHERE ProductId = p_ProductId AND IsDeleted = 0; END$$
DELIMITER ;
