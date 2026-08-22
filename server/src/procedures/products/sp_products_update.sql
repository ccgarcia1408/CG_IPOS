DELIMITER $$
USE `cg_ipos_db`$$
DROP PROCEDURE IF EXISTS `sp_products_update`$$
CREATE PROCEDURE `sp_products_update`(IN p_ProductId INT, IN p_CategoryId INT, IN p_Name VARCHAR(255), IN p_Description TEXT, IN p_Barcode VARCHAR(255), IN p_SKU VARCHAR(255), IN p_CostPrice DECIMAL(18,2), IN p_SellingPrice DECIMAL(18,2), IN p_ManufacturingDate DATE, IN p_ExpiryDate DATE, IN p_ImagePath TEXT, IN p_UpdatedBy INT, IN p_IsActive TINYINT)
BEGIN
    DECLARE v_OldValue JSON;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; SELECT 0 AS Success, 'Failed to update product.' AS Message; END;
    IF NOT EXISTS (SELECT 1 FROM products WHERE ProductId = p_ProductId AND IsDeleted = 0) THEN SELECT 0 AS Success, 'Product not found.' AS Message;
    ELSEIF EXISTS (SELECT 1 FROM products WHERE p_Barcode IS NOT NULL AND Barcode = p_Barcode AND ProductId <> p_ProductId AND IsDeleted = 0) THEN SELECT 0 AS Success, 'Barcode already exists.' AS Message;
    ELSEIF EXISTS (SELECT 1 FROM products WHERE p_SKU IS NOT NULL AND SKU = p_SKU AND ProductId <> p_ProductId AND IsDeleted = 0) THEN SELECT 0 AS Success, 'SKU already exists.' AS Message;
    ELSE
        START TRANSACTION;
        SELECT JSON_OBJECT('CategoryId', CategoryId, 'Name', Name, 'Barcode', Barcode, 'SKU', SKU, 'CostPrice', CostPrice, 'SellingPrice', SellingPrice, 'IsActive', IsActive) INTO v_OldValue FROM products WHERE ProductId = p_ProductId;
        UPDATE products SET CategoryId = p_CategoryId, Name = p_Name, Description = p_Description, Barcode = p_Barcode, SKU = p_SKU, CostPrice = p_CostPrice, SellingPrice = p_SellingPrice, ManufacturingDate = p_ManufacturingDate, ExpiryDate = p_ExpiryDate, ImagePath = p_ImagePath, IsActive = p_IsActive, UpdatedAt = NOW(), UpdatedBy = p_UpdatedBy WHERE ProductId = p_ProductId;
        INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy) VALUES ('UPDATE', 'Updated product', 'products', p_ProductId, v_OldValue, JSON_OBJECT('CategoryId', p_CategoryId, 'Name', p_Name, 'Barcode', p_Barcode, 'SKU', p_SKU, 'CostPrice', p_CostPrice, 'SellingPrice', p_SellingPrice, 'IsActive', p_IsActive), p_UpdatedBy);
        COMMIT;
        SELECT 1 AS Success, 'Product updated successfully.' AS Message;
    END IF;
END$$
DELIMITER ;
