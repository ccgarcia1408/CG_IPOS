DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_suppliers_delete`$$

-- Suppliers are referenced by RESTRICT FK from purchases. getById filters on IsDeleted, so a
-- true soft-delete would make a supplier permanently unfetchable by ID once any purchase
-- references it. "Delete" therefore deactivates, matching sp_products_delete's precedent.
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_suppliers_delete`(
    IN p_SupplierId INT,
    IN p_DeletedBy INT
)
BEGIN

    DECLARE v_OldValue JSON;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to deactivate supplier.' AS Message;
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
        'IsActive', IsActive,
        'IsDeleted', IsDeleted
    )
    INTO v_OldValue
    FROM suppliers
    WHERE SupplierId = p_SupplierId;

    -- DEACTIVATE
    UPDATE suppliers
    SET
        IsActive = 0,
        UpdatedAt = NOW(),
        UpdatedBy = p_DeletedBy
    WHERE SupplierId = p_SupplierId
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
        'Deactivated supplier',
        'suppliers',
        p_SupplierId,
        v_OldValue,
        JSON_OBJECT(
            'IsActive', 0
        ),
        p_DeletedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Supplier deactivated successfully.' AS Message;

END$$

DELIMITER ;
