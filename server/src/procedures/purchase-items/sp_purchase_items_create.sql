DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_purchase_items_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_purchase_items_create`(
    IN p_ProductId INT,
    IN p_Quantity INT,
    IN p_CostPrice DECIMAL(18,2),
    IN p_Total DECIMAL(18,2),
    IN p_CreatedBy INT
)
BEGIN

    DECLARE v_PurchaseItemId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to create purchase item.' AS Message;
    END;

    START TRANSACTION;

    INSERT INTO purchase_items (
        ProductId,
        Quantity,
        CostPrice,
        Total,
        IsDeleted,
        CreatedAt,
        CreatedBy
    )
    VALUES (
        p_ProductId,
        p_Quantity,
        p_CostPrice,
        p_Total,
        0,
        NOW(),
        p_CreatedBy
    );

    SET v_PurchaseItemId = LAST_INSERT_ID();

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
        'Created purchase item',
        'purchase_items',
        v_PurchaseItemId,
        NULL,
        JSON_OBJECT(
            'ProductId', p_ProductId,
            'Quantity', p_Quantity,
            'CostPrice', p_CostPrice,
            'Total', p_Total
        ),
        p_CreatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Purchase item created successfully.' AS Message,
        v_PurchaseItemId AS PurchaseItemId;

END$$

DELIMITER ;