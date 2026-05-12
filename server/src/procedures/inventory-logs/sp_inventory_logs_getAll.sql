DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_inventory_logs_getAll`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_inventory_logs_getAll`()
BEGIN
    SELECT
	il.InventoryLogId,
	il.ProductId,
	il.Type,
	il.ReferenceId,
	il.Quantity,
	il.StockBefore,
	il.StockAfter,
	il.IsDeleted,
	il.DeletedBy,
	il.DateDeleted,
	il.CreatedAt,
	il.CreatedBy,
	il.UpdatedAt,
	il.UpdatedBy
    FROM inventory_logs il
    WHERE il.IsDeleted = 0
    ;
END$$

DELIMITER ;