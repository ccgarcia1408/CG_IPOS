DELIMITER $$
USE `cg_ipos_db`$$
DROP PROCEDURE IF EXISTS `sp_products_create`$$
CREATE PROCEDURE `sp_products_create`(IN p_CategoryId INT, IN p_Name VARCHAR(255), IN p_Description TEXT, IN p_Barcode VARCHAR(255), IN p_SKU VARCHAR(255), IN p_CostPrice DECIMAL(18,2), IN p_SellingPrice DECIMAL(18,2), IN p_ManufacturingDate DATE, IN p_ExpiryDate DATE, IN p_ImagePath TEXT, IN p_CreatedBy INT)
BEGIN
    DECLARE v_ProductId INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; SELECT 0 AS Success, 'Failed to create product.' AS Message, NULL AS ProductId; END;
    IF EXISTS (SELECT 1 FROM products WHERE p_Barcode IS NOT NULL AND Barcode = p_Barcode AND IsDeleted = 0) THEN SELECT 0 AS Success, 'Barcode already exists.' AS Message, NULL AS ProductId;
    ELSEIF EXISTS (SELECT 1 FROM products WHERE p_SKU IS NOT NULL AND SKU = p_SKU AND IsDeleted = 0) THEN SELECT 0 AS Success, 'SKU already exists.' AS Message, NULL AS ProductId;
    ELSE
        START TRANSACTION;
        INSERT INTO products (CategoryId, Name, Description, Barcode, SKU, CostPrice, SellingPrice, ManufacturingDate, ExpiryDate, ImagePath, CreatedBy, IsActive) VALUES (p_CategoryId, p_Name, p_Description, p_Barcode, p_SKU, p_CostPrice, p_SellingPrice, p_ManufacturingDate, p_ExpiryDate, p_ImagePath, p_CreatedBy, 1);
        SET v_ProductId = LAST_INSERT_ID();
        INSERT INTO audit_logs (ActionType, `Action`, TableName, RecordId, OldValue, NewValue, CreatedBy) VALUES ('CREATE', 'Created product', 'products', v_ProductId, NULL, JSON_OBJECT('CategoryId', p_CategoryId, 'Name', p_Name, 'Barcode', p_Barcode, 'SKU', p_SKU, 'CostPrice', p_CostPrice, 'SellingPrice', p_SellingPrice), p_CreatedBy);
        COMMIT;
        SELECT 1 AS Success, 'Product created successfully.' AS Message, v_ProductId AS ProductId;
    END IF;
END$$
DELIMITER ;
