DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_products_update`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_products_update`(
    IN `p_ProductId` INT, 
    IN `p_BranchId` INT, 
    IN `p_CategoryId` INT, 
    IN `p_Name` VARCHAR(255), 
    IN `p_Description` TEXT, 
    IN `p_Barcode` VARCHAR(255), 
    IN `p_CostPrice` DECIMAL(18,2), 
    IN `p_SellingPrice` DECIMAL(18,2), 
    IN `p_Stock` INT, 
    IN `p_MinimumStock` INT,
    IN `p_ManufacturingDate` DATE,
    IN `p_ExpiryDate` DATE,
    IN `p_ImagePath` TEXT, 
    IN `p_UpdatedBy` INT, 
    IN `p_IsActive` TINYINT
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
    
    -- CHECK IF PRODUCT EXISTS
    IF NOT EXISTS (
        SELECT 1
        FROM products
        WHERE ProductId = p_ProductId
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Product not found.' AS Message;
    
    -- CHECK DUPLICATE PRODUCT NAME IN A BRANCH (EXCLUDE CURRENT PRODUCT)
    ELSEIF EXISTS (
        SELECT 1
        FROM products
        WHERE TRIM(NAME) = TRIM(p_Name)
          AND BranchId = p_BranchId
          AND ProductId <> p_ProductId
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Product name already exists in that branch.' AS Message;

    ELSE
    
    
    START TRANSACTION;
    
        -- OLD VALUE
        SELECT JSON_OBJECT(
            'BranchId', BranchId,
            'CategoryId', CategoryId,
            'Name', `Name`,
            'Description', `Description`,
            'Barcode', Barcode,
            'CostPrice', CostPrice,
            'SellingPrice', SellingPrice,
            'Stock', Stock,
            'MinimumStock', MinimumStock,
            'ManufacturingDate', ManufacturingDate,
            'ExpiryDate', ExpiryDate,
            'ImagePath', ImagePath,
            'IsActive', IsActive
        )
        INTO v_OldValue
        FROM products
        WHERE ProductId = p_ProductId;
        
        -- UPDATE
        UPDATE products
        SET
            BranchId = p_BranchId,
            CategoryId = p_CategoryId,
            `Name` = p_Name,
            `Description` = p_Description,
            Barcode = p_Barcode,
            CostPrice = p_CostPrice,
            SellingPrice = p_SellingPrice,
            Stock = p_Stock,
            MinimumStock = p_MinimumStock,
            ManufacturingDate = p_ManufacturingDate,
            ExpiryDate = p_ExpiryDate,
            ImagePath = p_ImagePath,
            UpdatedAt = NOW(),
            UpdatedBy = p_UpdatedBy,
            IsActive = p_IsActive
        WHERE ProductId = p_ProductId
        AND IsDeleted = 0;
    
        -- NEW VALUE
        SET v_NewValue = JSON_OBJECT(
            'BranchId', p_BranchId,
            'CategoryId', p_CategoryId,
            'Name', p_Name,
            'Description', p_Description,
            'Barcode', p_Barcode,
            'CostPrice', p_CostPrice,
            'SellingPrice', p_SellingPrice,
            'Stock', p_Stock,
            'MinimumStock', p_MinimumStock,
            'ManufacturingDate', p_ManufacturingDate,
            'ExpiryDate', p_ExpiryDate,
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

    END IF;
END$$

DELIMITER ;