DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_regions_delete`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_regions_delete`(
	IN `p_RegionId` INT, 
	IN `p_DeletedBy` INT
)
BEGIN
    DECLARE v_OldValue JSON;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT
            0 AS Success,
            'Failed to delete region.' AS Message;
    END;
    
    START TRANSACTION;
    
    -- OLD VALUE
    SELECT JSON_OBJECT(
        'Name', NAME,
        'Description', Description,
        'IsActive', IsActive,
        'IsDeleted', IsDeleted
    )
    INTO v_OldValue
    FROM regions
    WHERE RegionId = p_RegionId;
    
    -- SOFT DELETE
    UPDATE regions
    SET
        IsDeleted = 1,
        DeletedBy = p_DeletedBy,
        DateDeleted = NOW()
    WHERE RegionId = p_RegionId
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
        'Deleted region',
        'regions',
        p_RegionId,
        v_OldValue,
        JSON_OBJECT(
            'IsDeleted', 1
        ),
        p_DeletedBy
    );
    
    COMMIT;
    
    SELECT
        1 AS Success,
        'Region deleted successfully.' AS Message;
END$$

DELIMITER ;