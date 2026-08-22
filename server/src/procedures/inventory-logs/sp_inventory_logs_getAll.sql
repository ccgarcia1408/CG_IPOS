DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_inventory_logs_getAll`$$

-- Movement history, most recent first. Optional filters: branch and/or product.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_inventory_logs_getAll`(
    IN p_BranchId INT,
    IN p_ProductId INT
)
BEGIN
    SELECT
        il.InventoryLogId,
        il.BranchId,
        b.Name AS BranchName,
        il.ProductId,
        p.Name AS ProductName,
        p.SKU,
        p.Barcode,
        il.TransactionType,
        il.ReferenceType,
        il.ReferenceId,
        il.Remarks,
        il.Quantity,
        il.StockBefore,
        il.StockAfter,
        il.CreatedAt,
        il.CreatedBy
    FROM inventory_logs il
    INNER JOIN branches b ON b.BranchId = il.BranchId
    INNER JOIN products p ON p.ProductId = il.ProductId
    WHERE il.IsDeleted = 0
      AND (p_BranchId IS NULL OR il.BranchId = p_BranchId)
      AND (p_ProductId IS NULL OR il.ProductId = p_ProductId)
    ORDER BY il.CreatedAt DESC, il.InventoryLogId DESC;
END$$

DELIMITER ;
