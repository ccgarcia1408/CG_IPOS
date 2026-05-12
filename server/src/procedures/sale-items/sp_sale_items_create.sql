DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_sale_items_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_sale_items_create`(
    IN p_ProductId INT,
    IN p_Quantity INT,
    IN p_Price DECIMAL(18,2),
    IN p_Discount DECIMAL(18,2),
    IN p_Total DECIMAL(18,2),
    IN p_CreatedBy INT
)
BEGIN

    DECLARE v_SaleItemId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to create sale item.' AS Message;
    END;

    START TRANSACTION;

    INSERT INTO sale_items (
        ProductId,
        Quantity,
        Price,
        Discount,
        Total,
        IsDeleted,
        CreatedAt,
        CreatedBy
    )
    VALUES (
        p_ProductId,
        p_Quantity,
        p_Price,
        p_Discount,
        p_Total,
        0,
        NOW(),
        p_CreatedBy
    );

    SET v_SaleItemId = LAST_INSERT_ID();

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
        'Created sale item',
        'sale_items',
        v_SaleItemId,
        NULL,
        JSON_OBJECT(
            'ProductId', p_ProductId,
            'Quantity', p_Quantity,
            'Price', p_Price,
            'Discount', p_Discount,
            'Total', p_Total
        ),
        p_CreatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Sale item created successfully.' AS Message,
        v_SaleItemId AS SaleItemId;

END$$

DELIMITER ;