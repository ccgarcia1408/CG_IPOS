DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_inventory_logs_update`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_inventory_logs_update`(
    IN p_InventoryLogId INT,
    IN p_ProductId INT,
    IN p_Type VARCHAR(100),
    IN p_ReferenceId INT,
    IN p_Quantity INT,
    IN p_StockBefore INT,
    IN p_StockAfter INT,
    IN p_UpdatedBy INT
)
BEGIN

    DECLARE v_OldValue JSON;
    DECLARE v_NewValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to update inventory log.' AS Message;
    END;

    START TRANSACTION;

    -- OLD VALUE
    SELECT JSON_OBJECT(
        'ProductId', ProductId,
        'Type', TYPE,
        'ReferenceId', ReferenceId,
        'Quantity', Quantity,
        'StockBefore', StockBefore,
        'StockAfter', StockAfter
    )
    INTO v_OldValue
    FROM inventory_logs
    WHERE InventoryLogId = p_InventoryLogId;

    UPDATE inventory_logs
    SET
        ProductId = p_ProductId,
        TYPE = p_Type,
        ReferenceId = p_ReferenceId,
        Quantity = p_Quantity,
        StockBefore = p_StockBefore,
        StockAfter = p_StockAfter,
        UpdatedAt = NOW(),
        UpdatedBy = p_UpdatedBy
    WHERE InventoryLogId = p_InventoryLogId
    AND IsDeleted = 0;

    -- NEW VALUE
    SET v_NewValue = JSON_OBJECT(
        'ProductId', p_ProductId,
        'Type', p_Type,
        'ReferenceId', p_ReferenceId,
        'Quantity', p_Quantity,
        'StockBefore', p_StockBefore,
        'StockAfter', p_StockAfter
    );

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
        'UPDATE',
        'Updated inventory log',
        'inventory_logs',
        p_InventoryLogId,
        v_OldValue,
        v_NewValue,
        p_UpdatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Inventory log updated successfully.' AS Message;

END$$

DELIMITER ;