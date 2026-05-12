DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_products_update`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_products_update`(
    IN p_ProductId INT,
    IN p_CategoryId INT,
    IN p_Name VARCHAR(255),
    IN p_Description TEXT,
    IN p_Barcode VARCHAR(255),
    IN p_CostPrice DECIMAL(18,2),
    IN p_SellingPrice DECIMAL(18,2),
    IN p_Stock INT,
    IN p_MinimumStock INT,
    IN p_ImagePath TEXT,
    IN p_UpdatedBy INT,
    IN p_IsActive TINYINT
)
BEGIN

    DECLARE v_OldValue JSON;
    DECLARE v_NewValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to update product.' AS Message;
    END;

    START TRANSACTION;

    -- OLD VALUE
    SELECT JSON_OBJECT(
        'CategoryId', CategoryId,
        'Name', NAME,
        'Description', Description,
        'Barcode', Barcode,
        'CostPrice', CostPrice,
        'SellingPrice', SellingPrice,
        'Stock', Stock,
        'MinimumStock', MinimumStock,
        'ImagePath', ImagePath,
        'IsActive', IsActive
    )
    INTO v_OldValue
    FROM products
    WHERE ProductId = p_ProductId;

    UPDATE products
    SET
        CategoryId = p_CategoryId,
        NAME = p_Name,
        Description = p_Description,
        Barcode = p_Barcode,
        CostPrice = p_CostPrice,
        SellingPrice = p_SellingPrice,
        Stock = p_Stock,
        MinimumStock = p_MinimumStock,
        ImagePath = p_ImagePath,
        UpdatedAt = NOW(),
        UpdatedBy = p_UpdatedBy,
        IsActive = p_IsActive
    WHERE ProductId = p_ProductId
    AND IsDeleted = 0;

    -- NEW VALUE
    SET v_NewValue = JSON_OBJECT(
        'CategoryId', p_CategoryId,
        'Name', p_Name,
        'Description', p_Description,
        'Barcode', p_Barcode,
        'CostPrice', p_CostPrice,
        'SellingPrice', p_SellingPrice,
        'Stock', p_Stock,
        'MinimumStock', p_MinimumStock,
        'ImagePath', p_ImagePath,
        'IsActive', p_IsActive
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
        'Updated product',
        'products',
        p_ProductId,
        v_OldValue,
        v_NewValue,
        p_UpdatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Product updated successfully.' AS Message;

END$$

DELIMITER ;