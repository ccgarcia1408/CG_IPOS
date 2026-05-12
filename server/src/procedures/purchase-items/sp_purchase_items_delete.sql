DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_purchase_items_delete`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_purchase_items_delete`(
    IN p_PurchaseItemId INT,
    IN p_DeletedBy INT
)
BEGIN

    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to delete purchase item.' AS Message;
    END;

    START TRANSACTION;

    -- OLD VALUE
    SELECT JSON_OBJECT(
        'ProductId', ProductId,
        'Quantity', Quantity,
        'CostPrice', CostPrice,
        'Total', Total,
        'IsDeleted', IsDeleted
    )
    INTO v_OldValue
    FROM purchase_items
    WHERE PurchaseItemId = p_PurchaseItemId;

    -- SOFT DELETE
    UPDATE purchase_items
    SET
        IsDeleted = 1,
        DeletedBy = p_DeletedBy,
        DateDeleted = NOW()
    WHERE PurchaseItemId = p_PurchaseItemId
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
        'Deleted purchase item',
        'purchase_items',
        p_PurchaseItemId,
        v_OldValue,
        JSON_OBJECT(
            'IsDeleted', 1
        ),
        p_DeletedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Purchase item deleted successfully.' AS Message;

END$$

DELIMITER ;