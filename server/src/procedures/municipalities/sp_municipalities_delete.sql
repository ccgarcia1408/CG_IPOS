DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_municipalities_delete`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_municipalities_delete`(
	IN `p_MunicipalityId` INT, 
	IN `p_DeletedBy` INT
)
BEGIN
    DECLARE v_OldValue JSON;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT
            0 AS Success,
            'Failed to delete municipality.' AS Message;
    END;
    
    START TRANSACTION;
    
    -- OLD VALUE
    SELECT JSON_OBJECT(
        'ProvinceId', ProvinceId,
        'Name', `Name`,
        'IsActive', IsActive,
        'IsDeleted', IsDeleted
    )
    INTO v_OldValue
    FROM municipalities
    WHERE MunicipalityId = p_MunicipalityId;
    
    -- SOFT DELETE
    UPDATE municipalities
    SET
        IsDeleted = 1,
        DeletedBy = p_DeletedBy,
        DateDeleted = NOW()
    WHERE MunicipalityId = p_MunicipalityId
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
        'Deleted municipality',
        'municipalities',
        p_MunicipalityId,
        v_OldValue,
        JSON_OBJECT(
            'IsDeleted', 1
        ),
        p_DeletedBy
    );
    
    COMMIT;
    
    SELECT
        1 AS Success,
        'Municipality deleted successfully.' AS Message;
END$$

DELIMITER ;