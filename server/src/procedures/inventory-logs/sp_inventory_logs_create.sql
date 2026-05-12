DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_inventory_logs_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_inventory_logs_create`(
    IN p_ProductId INT,
    IN p_Type VARCHAR(100),
    IN p_ReferenceId INT,
    IN p_Quantity INT,
    IN p_StockBefore INT,
    IN p_StockAfter INT,
    IN p_CreatedBy INT
)
BEGIN

    DECLARE v_InventoryLogId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to create inventory log.' AS Message;
    END;

    START TRANSACTION;

    INSERT INTO inventory_logs (
        ProductId,
        TYPE,
        ReferenceId,
        Quantity,
        StockBefore,
        StockAfter,
        IsDeleted,
        CreatedAt,
        CreatedBy
    )
    VALUES (
        p_ProductId,
        p_Type,
        p_ReferenceId,
        p_Quantity,
        p_StockBefore,
        p_StockAfter,
        0,
        NOW(),
        p_CreatedBy
    );

    SET v_InventoryLogId = LAST_INSERT_ID();

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
        'CREATE',
        'Created inventory log',
        'inventory_logs',
        v_InventoryLogId,
        NULL,
        JSON_OBJECT(
            'ProductId', p_ProductId,
            'Type', p_Type,
            'ReferenceId', p_ReferenceId,
            'Quantity', p_Quantity,
            'StockBefore', p_StockBefore,
            'StockAfter', p_StockAfter
        ),
        p_CreatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Inventory log created successfully.' AS Message,
        v_InventoryLogId AS InventoryLogId;

END$$

DELIMITER ;