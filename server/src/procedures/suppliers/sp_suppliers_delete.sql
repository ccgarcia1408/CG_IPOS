DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_suppliers_delete`$$

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
            'Failed to delete supplier.' AS Message;
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

    -- SOFT DELETE
    UPDATE suppliers
    SET
        IsDeleted = 1,
        DeletedBy = p_DeletedBy,
        DateDeleted = NOW()
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
        'DELETE',
        'Deleted supplier',
        'suppliers',
        p_SupplierId,
        v_OldValue,
        JSON_OBJECT(
            'IsDeleted', 1
        ),
        p_DeletedBy
    );

    COMMIT;

    SELECT
        1 AS Success,
        'Supplier deleted successfully.' AS Message;

END$$

DELIMITER ;
