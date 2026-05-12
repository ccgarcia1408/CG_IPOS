DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_sale_items_update`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_sale_items_update`(
    IN p_SaleItemId INT,
    IN p_ProductId INT,
    IN p_Quantity INT,
    IN p_Price DECIMAL(18,2),
    IN p_Discount DECIMAL(18,2),
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
            'Failed to update sale item.' AS Message;
    END;

    START TRANSACTION;

    -- OLD VALUE
    SELECT JSON_OBJECT(
        'ProductId', ProductId,
        'Quantity', Quantity,
        'Price', Price,
        'Discount', Discount,
        'Total', Total
    )
    INTO v_OldValue
    FROM sale_items
    WHERE SaleItemId = p_SaleItemId;

    UPDATE sale_items
    SET
        ProductId = p_ProductId,
        Quantity = p_Quantity,
        Price = p_Price,
        Discount = p_Discount,
        Total = p_Total,
        UpdatedAt = NOW(),
        UpdatedBy = p_UpdatedBy
    WHERE SaleItemId = p_SaleItemId
    AND IsDeleted = 0;

    -- NEW VALUE
    SET v_NewValue = JSON_OBJECT(
        'ProductId', p_ProductId,
        'Quantity', p_Quantity,
        'Price', p_Price,
        'Discount', p_Discount,
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
        'Updated sale item',
        'sale_items',
        p_SaleItemId,
        v_OldValue,
        v_NewValue,
        p_UpdatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Sale item updated successfully.' AS Message;

END$$

DELIMITER ;