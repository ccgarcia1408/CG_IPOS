DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_products_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_products_getAll`()
BEGIN
    SELECT
	p.ProductId,
	p.CategoryId,
	p.Name,
	p.Description,
	p.Barcode,
	p.CostPrice,
	p.SellingPrice,
	p.Stock,
	p.MinimumStock,
	p.ImagePath,
	p.IsDeleted,
	p.DeletedBy,
	p.DateDeleted,
	p.CreatedAt,
	p.CreatedBy,
	p.UpdatedAt,
	p.UpdatedBy,
	p.IsActive
    FROM products p
    WHERE p.IsDeleted = 0
    ;
END$$

DELIMITER ;