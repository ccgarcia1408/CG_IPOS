DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_products_getAllActive`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_products_getAllActive`()
BEGIN
    SELECT
        p.ProductId,
        p.BranchId,
        p.CategoryId,
        p.Name,
        p.Description,
        p.Barcode,
        p.SKU,
        p.CostPrice,
        p.SellingPrice,
        p.Stock,
        p.MinimumStock,
        p.ManufacturingDate,
        p.ExpiryDate,
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
      AND p.IsActive = 1;
END$$

DELIMITER ;
