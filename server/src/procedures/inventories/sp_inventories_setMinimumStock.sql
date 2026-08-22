DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_inventories_setMinimumStock`$$

-- Sets the reorder threshold for a branch/product. Does not move stock or write inventory_logs
-- (no quantity changes hands) — only an audit_logs entry, matching how reference-data config
-- changes are recorded elsewhere.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_inventories_setMinimumStock`(
    IN p_BranchId INT,
    IN p_ProductId INT,
    IN p_MinimumStock INT,
    IN p_UpdatedBy INT
)
BEGIN
    DECLARE v_OldMinimumStock INT DEFAULT NULL;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 0 AS Success, 'Failed to update minimum stock.' AS Message;
    END;

    IF p_MinimumStock IS NULL OR p_MinimumStock < 0 THEN
        SELECT 0 AS Success, 'Minimum stock must be a non-negative whole number.' AS Message;
    ELSE
        START TRANSACTION;

        INSERT INTO inventories (BranchId, ProductId, Quantity, MinimumStock)
        VALUES (p_BranchId, p_ProductId, 0, p_MinimumStock)
        ON DUPLICATE KEY UPDATE InventoryId = InventoryId;

        SELECT MinimumStock INTO v_OldMinimumStock
        FROM inventories
        WHERE BranchId = p_BranchId AND ProductId = p_ProductId
        FOR UPDATE;

        UPDATE inventories
        SET MinimumStock = p_MinimumStock
        WHERE BranchId = p_BranchId AND ProductId = p_ProductId;

        INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy)
        VALUES (
            'UPDATE', 'Updated minimum stock', 'inventories', p_ProductId,
            JSON_OBJECT('MinimumStock', v_OldMinimumStock),
            JSON_OBJECT('BranchId', p_BranchId, 'ProductId', p_ProductId, 'MinimumStock', p_MinimumStock),
            p_UpdatedBy
        );

        COMMIT;

        SELECT 1 AS Success, 'Minimum stock updated successfully.' AS Message;
    END IF;
END$$

DELIMITER ;
