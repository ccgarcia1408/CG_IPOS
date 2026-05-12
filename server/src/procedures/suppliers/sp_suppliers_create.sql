DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_suppliers_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_suppliers_create`(
    IN p_SupplierName VARCHAR(255),
    IN p_ContactPerson VARCHAR(255),
    IN p_ContactNo VARCHAR(100),
    IN p_Email VARCHAR(255),
    IN p_Address TEXT,
    IN p_CreatedBy INT
)
BEGIN

    DECLARE v_SupplierId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to create supplier.' AS Message;
    END;

    START TRANSACTION;

    INSERT INTO suppliers (
        SupplierName,
        ContactPerson,
        ContactNo,
        Email,
        Address,
        IsDeleted,
        CreatedAt,
        CreatedBy,
        IsActive
    )
    VALUES (
        p_SupplierName,
        p_ContactPerson,
        p_ContactNo,
        p_Email,
        p_Address,
        0,
        NOW(),
        p_CreatedBy,
        1
    );

    SET v_SupplierId = LAST_INSERT_ID();

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
        'Created supplier',
        'suppliers',
        v_SupplierId,
        NULL,
        JSON_OBJECT(
            'SupplierName', p_SupplierName,
            'ContactPerson', p_ContactPerson,
            'ContactNo', p_ContactNo,
            'Email', p_Email,
            'Address', p_Address,
            'IsActive', 1
        ),
        p_CreatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Supplier created successfully.' AS Message,
        v_SupplierId AS SupplierId;

END$$

DELIMITER ;