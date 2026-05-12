DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_inventory_logs_delete`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_inventory_logs_delete`(
    IN p_InventoryLogId INT,
    IN p_DeletedBy INT
)
BEGIN

    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to delete inventory log.' AS Message;
    END;

    START TRANSACTION;

    -- OLD VALUE
    SELECT JSON_OBJECT(
        'ProductId', ProductId,
        'Type', TYPE,
        'ReferenceId', ReferenceId,
        'Quantity', Quantity,
        'StockBefore', StockBefore,
        'StockAfter', StockAfter,
        'IsDeleted', IsDeleted
    )
    INTO v_OldValue
    FROM inventory_logs
    WHERE InventoryLogId = p_InventoryLogId;

    -- SOFT DELETE
    UPDATE inventory_logs
    SET
        IsDeleted = 1,
        DeletedBy = p_DeletedBy,
        DateDeleted = NOW()
    WHERE InventoryLogId = p_InventoryLogId
    AND IsDeleted = 0;

    -- AUDIT LOG
    INSERT INTO audit_logs (
        ActionType,
        `Action`,
        TableName,
        RecordId,
        OldValue,
        NewValue,
        CreatedBy
    )
    VALUES (
        'DELETE',
        'Deleted inventory log',
        'inventory_logs',
        p_InventoryLogId,
        v_OldValue,
        JSON_OBJECT(
            'IsDeleted', 1
        ),
        p_DeletedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Inventory log deleted successfully.' AS Message;

END$$

DELIMITER ;