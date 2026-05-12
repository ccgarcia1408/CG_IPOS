DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_products_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_products_getById`(
	IN p_ProductId INT
)
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
    WHERE p.ProductId = p_ProductId
    AND p.IsDeleted = 0
    ;
END$$

DELIMITER ;