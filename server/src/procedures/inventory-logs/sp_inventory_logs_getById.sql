DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_inventory_logs_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_inventory_logs_getById`(IN p_InventoryLogId INT)
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
    WHERE il.InventoryLogId = p_InventoryLogId
      AND il.IsDeleted = 0
    LIMIT 1;
END$$

DELIMITER ;
