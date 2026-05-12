DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_inventory_logs_getById`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_inventory_logs_getById`(
    IN p_InventoryLogId INT
)
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
    WHERE il.InventoryLogId = p_InventoryLogId
    AND il.IsDeleted = 0
    LIMIT 1;

END$$

DELIMITER ;