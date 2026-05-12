DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_products_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_products_create`(
    IN p_CategoryId INT,
    IN p_Name VARCHAR(255),
    IN p_Description TEXT,
    IN p_Barcode VARCHAR(255),
    IN p_CostPrice DECIMAL(18,2),
    IN p_SellingPrice DECIMAL(18,2),
    IN p_Stock INT,
    IN p_MinimumStock INT,
    IN p_ImagePath TEXT,
    IN p_CreatedBy INT
)
BEGIN

    DECLARE v_ProductId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to create product.' AS Message;
    END;

    START TRANSACTION;

    INSERT INTO products (
        CategoryId,
        NAME,
        Description,
        Barcode,
        CostPrice,
        SellingPrice,
        Stock,
        MinimumStock,
        ImagePath,
        IsDeleted,
        CreatedAt,
        CreatedBy,
        IsActive
    )
    VALUES (
        p_CategoryId,
        p_Name,
        p_Description,
        p_Barcode,
        p_CostPrice,
        p_SellingPrice,
        p_Stock,
        p_MinimumStock,
        p_ImagePath,
        0,
        NOW(),
        p_CreatedBy,
        1
    );

    SET v_ProductId = LAST_INSERT_ID();

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
        'Created product',
        'products',
        v_ProductId,
        NULL,
        JSON_OBJECT(
            'CategoryId', p_CategoryId,
            'Name', p_Name,
            'Description', p_Description,
            'Barcode', p_Barcode,
            'CostPrice', p_CostPrice,
            'SellingPrice', p_SellingPrice,
            'Stock', p_Stock,
            'MinimumStock', p_MinimumStock,
            'ImagePath', p_ImagePath,
            'IsActive', 1
        ),
        p_CreatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Product created successfully.' AS Message,
        v_ProductId AS ProductId;

END$$

DELIMITER ;