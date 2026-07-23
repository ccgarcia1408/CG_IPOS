DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_barangays_delete`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_barangays_delete`(
	IN `p_BarangayId` INT, 
	IN `p_DeletedBy` INT
)
BEGIN
    DECLARE v_OldValue JSON;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT
            0 AS Success,
            'Failed to delete barangay.' AS Message;
    END;
    
    START TRANSACTION;
    
    -- OLD VALUE
    SELECT JSON_OBJECT(
        'MunicipalityId', MunicipalityId,
        'Name', `Name`,
        'IsActive', IsActive,
        'IsDeleted', IsDeleted
    )
    INTO v_OldValue
    FROM barangays
    WHERE BarangayId = p_BarangayId;
    
    -- SOFT DELETE
    UPDATE barangays
    SET
        IsDeleted = 1,
        DeletedBy = p_DeletedBy,
        DateDeleted = NOW()
    WHERE BarangayId = p_BarangayId
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
        'Deleted barangay',
        'barangays',
        p_BarangayId,
        v_OldValue,
        JSON_OBJECT(
            'IsDeleted', 1
        ),
        p_DeletedBy
    );
    
    COMMIT;
    
    SELECT
        1 AS Success,
        'Barangay deleted successfully.' AS Message;
END$$

DELIMITER ;