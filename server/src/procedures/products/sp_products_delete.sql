DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_products_delete`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_products_delete`(
    IN p_ProductId INT,
    IN p_DeletedBy INT
)
BEGIN

    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to delete product.' AS Message;
    END;

    START TRANSACTION;

    -- OLD VALUE
    SELECT JSON_OBJECT(
        'CategoryId', CategoryId,
        'Name', NAME,
        'Description', Description,
        'Barcode', Barcode,
        'SKU', SKU,
        'CostPrice', CostPrice,
        'SellingPrice', SellingPrice,
        'ImagePath', ImagePath,
        'IsActive', IsActive,
        'IsDeleted', IsDeleted
    )
    INTO v_OldValue
    FROM products
    WHERE ProductId = p_ProductId;

    -- Products are retained for historical purchases, sales, and inventory movements.
    -- Removing a product from normal use is an inactivation, not a deletion.
    UPDATE products
    SET
        IsActive = 0,
        UpdatedAt = NOW(),
        UpdatedBy = p_DeletedBy
    WHERE ProductId = p_ProductId
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
        'UPDATE',
        'Deactivated product',
        'products',
        p_ProductId,
        v_OldValue,
        JSON_OBJECT(
            'IsActive', 0
        ),
        p_DeletedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Product deactivated successfully.' AS Message;

END$$

DELIMITER ;
