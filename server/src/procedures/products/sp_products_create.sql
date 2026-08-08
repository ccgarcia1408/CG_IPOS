DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_products_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_products_create`(
	IN `p_BranchId` INT, 
	IN `p_CategoryId` INT, 
	IN `p_Name` VARCHAR(255), 
	IN `p_Description` TEXT, 
	IN `p_Barcode` VARCHAR(255),
	IN `p_SKU` VARCHAR(255),
	IN `p_CostPrice` DECIMAL(18,2), 
	IN `p_SellingPrice` DECIMAL(18,2), 
	IN `p_Stock` INT, 
	IN `p_MinimumStock` INT,
	IN `p_ManufacturingDate` DATE,
	IN `p_ExpiryDate` DATE,
	IN `p_ImagePath` TEXT, 
	IN `p_CreatedBy` INT
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
    
	-- CHECK IF PRODUCT NAME ALREADY EXISTS IN A BRANCH
	IF EXISTS (
		SELECT 1
		FROM products	
		WHERE TRIM(NAME) = TRIM(p_Name)
		  AND BranchId = p_BranchId
		  AND IsDeleted = 0
	) THEN

        SELECT
            0 AS Success,
            'Product name already exists in that branch.' AS Message,
            NULL AS ProductId;

	ELSE
    
	START TRANSACTION;

    INSERT INTO products 
	(
		BranchId,
		CategoryId,
		`Name`,
		`Description`,
		Barcode,
		SKU,
		CostPrice,
		SellingPrice,
		Stock,
		MinimumStock,
		ManufacturingDate,
		ExpiryDate,
		ImagePath,
		CreatedBy,
		IsActive
	)
    VALUES (
		p_BranchId,
		p_CategoryId,
		p_Name,
		p_Description,
		p_Barcode,
		p_SKU,
		p_CostPrice,
		p_SellingPrice,
		p_Stock,
		p_MinimumStock,
		p_ManufacturingDate,
		p_ExpiryDate,
		p_ImagePath,
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
		    'BranchId', p_BranchId,
		    'CategoryId', p_CategoryId,
		    'Name', p_Name,
		    'Description', p_Description,
		    'Barcode', p_Barcode,
			'SKU', p_SKU,
		    'CostPrice', p_CostPrice,
		    'SellingPrice', p_SellingPrice,
		    'Stock', p_Stock,
		    'MinimumStock', p_MinimumStock,
			'ManufacturingDate', p_ManufacturingDate,
			'ExpiryDate', p_ExpiryDate,
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
        
	END IF;
END$$

DELIMITER ;