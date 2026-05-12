DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_sale_items_delete`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_sale_items_delete`(
    IN p_SaleItemId INT,
    IN p_DeletedBy INT
)
BEGIN

    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to delete sale item.' AS Message;
    END;

    START TRANSACTION;

    -- OLD VALUE
    SELECT JSON_OBJECT(
        'ProductId', ProductId,
        'Quantity', Quantity,
        'Price', Price,
        'Discount', Discount,
        'Total', Total,
        'IsDeleted', IsDeleted
    )
    INTO v_OldValue
    FROM sale_items
    WHERE SaleItemId = p_SaleItemId;

    -- SOFT DELETE
    UPDATE sale_items
    SET
        IsDeleted = 1,
        DeletedBy = p_DeletedBy,
        DateDeleted = NOW()
    WHERE SaleItemId = p_SaleItemId
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
        'Deleted sale item',
        'sale_items',
        p_SaleItemId,
        v_OldValue,
        JSON_OBJECT(
            'IsDeleted', 1
        ),
        p_DeletedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Sale item deleted successfully.' AS Message;

END$$

DELIMITER ;