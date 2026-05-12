DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_purchase_items_update`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_purchase_items_update`(
    IN p_PurchaseItemId INT,
    IN p_ProductId INT,
    IN p_Quantity INT,
    IN p_CostPrice DECIMAL(18,2),
    IN p_Total DECIMAL(18,2),
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
            'Failed to update purchase item.' AS Message;
    END;

    START TRANSACTION;

    -- OLD VALUE
    SELECT JSON_OBJECT(
        'ProductId', ProductId,
        'Quantity', Quantity,
        'CostPrice', CostPrice,
        'Total', Total
    )
    INTO v_OldValue
    FROM purchase_items
    WHERE PurchaseItemId = p_PurchaseItemId;

    UPDATE purchase_items
    SET
        ProductId = p_ProductId,
        Quantity = p_Quantity,
        CostPrice = p_CostPrice,
        Total = p_Total,
        UpdatedAt = NOW(),
        UpdatedBy = p_UpdatedBy
    WHERE PurchaseItemId = p_PurchaseItemId
    AND IsDeleted = 0;

    -- NEW VALUE
    SET v_NewValue = JSON_OBJECT(
        'ProductId', p_ProductId,
        'Quantity', p_Quantity,
        'CostPrice', p_CostPrice,
        'Total', p_Total
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
        'Updated purchase item',
        'purchase_items',
        p_PurchaseItemId,
        v_OldValue,
        v_NewValue,
        p_UpdatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Purchase item updated successfully.' AS Message;

END$$

DELIMITER ;