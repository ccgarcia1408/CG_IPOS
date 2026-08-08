DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_suppliers_update`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_suppliers_update`(
    IN p_SupplierId INT,
    IN p_SupplierName VARCHAR(255),
    IN p_ContactPerson VARCHAR(255),
    IN p_ContactNo VARCHAR(100),
    IN p_TelNo VARCHAR(100),
    IN p_Email VARCHAR(255),
    IN p_ProvinceId INT,
    IN p_MunicipalityId INT,
    IN p_BarangayId INT,
    IN p_OtherAddress TEXT,
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
            'Failed to update supplier.' AS Message;
    END;

    START TRANSACTION;

    -- OLD VALUE
    SELECT JSON_OBJECT(
        'SupplierName', SupplierName,
        'ContactPerson', ContactPerson,
        'ContactNo', ContactNo,
        'TelNo', TelNo,
        'Email', Email,
        'ProvinceId', ProvinceId,
        'MunicipalityId', MunicipalityId,
        'BarangayId', BarangayId,
        'OtherAddress', OtherAddress,
        'IsActive', IsActive
    )
    INTO v_OldValue
    FROM suppliers
    WHERE SupplierId = p_SupplierId;

    UPDATE suppliers
    SET
        SupplierName = p_SupplierName,
        ContactPerson = p_ContactPerson,
        ContactNo = p_ContactNo,
        TelNo = p_TelNo,
        Email = p_Email,
        ProvinceId = p_ProvinceId,
        MunicipalityId = p_MunicipalityId,
        BarangayId = p_BarangayId,
        OtherAddress = p_OtherAddress,
        UpdatedAt = NOW(),
        UpdatedBy = p_UpdatedBy,
        IsActive = p_IsActive
    WHERE SupplierId = p_SupplierId
    AND IsDeleted = 0;

    -- NEW VALUE
    SET v_NewValue = JSON_OBJECT(
        'SupplierName', p_SupplierName,
        'ContactPerson', p_ContactPerson,
        'ContactNo', p_ContactNo,
        'TelNo', p_TelNo,
        'Email', p_Email,
        'ProvinceId', p_ProvinceId,
        'MunicipalityId', p_MunicipalityId,
        'BarangayId', p_BarangayId,
        'OtherAddress', p_OtherAddress,
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
        'Updated supplier',
        'suppliers',
        p_SupplierId,
        v_OldValue,
        v_NewValue,
        p_UpdatedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Supplier updated successfully.' AS Message;

END$$

DELIMITER ;
