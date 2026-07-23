DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_provinces_update`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_provinces_update`(
    IN p_ProvinceId INT,
    IN p_RegionId INT,
    IN p_Name VARCHAR(255),
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
            'Failed to update province.' AS Message;
    END;

    -- Check if province exists
    IF NOT EXISTS (
        SELECT 1
        FROM provinces
        WHERE ProvinceId = p_ProvinceId
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Province not found.' AS Message;

    -- Check duplicate province name (exclude current province)
    ELSEIF EXISTS (
        SELECT 1
        FROM provinces
        WHERE TRIM(`Name`) = TRIM(p_Name)
          AND ProvinceId <> p_ProvinceId
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Province name already exists.' AS Message;

    ELSE

        START TRANSACTION;

        -- Store old values
        SELECT JSON_OBJECT(
            'RegionId' , p_RegionId,
            'Name', `Name`,
            'IsActive', IsActive
        )
        INTO v_OldValue
        FROM provinces
        WHERE ProvinceId = p_ProvinceId;

        -- Update branch
        UPDATE provinces
        SET
	    RegionId = p_RegionId,
            `Name` = TRIM(p_Name),
            UpdatedAt = NOW(),
            UpdatedBy = p_UpdatedBy,
            IsActive = p_IsActive
        WHERE ProvinceId = p_ProvinceId
          AND IsDeleted = 0;

        -- Store new values
        SET v_NewValue = JSON_OBJECT(
            'RegionId', p_RegionId,
            'Name', TRIM(p_Name),
            'IsActive', p_IsActive
        );

        -- Audit log
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
            'Updated province',
            'provinces',
            p_ProvinceId,
            v_OldValue,
            v_NewValue,
            p_UpdatedBy
        );

        COMMIT;

        SELECT
            1 AS Success,
            'Province updated successfully.' AS Message;

    END IF;

END$$

DELIMITER ;