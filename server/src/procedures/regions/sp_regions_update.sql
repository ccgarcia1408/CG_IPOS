DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_regions_update`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_regions_update`(
    IN p_RegionId INT,
    IN p_Name VARCHAR(255),
    IN p_Description VARCHAR(255),
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
            'Failed to update region.' AS Message;
    END;

    -- Check if region exists
    IF NOT EXISTS (
        SELECT 1
        FROM regions
        WHERE RegionId = p_RegionId
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Region not found.' AS Message;

    -- Check duplicate region name (exclude current region)
    ELSEIF EXISTS (
        SELECT 1
        FROM regions
        WHERE TRIM(`Name`) = TRIM(p_Name)
          AND TRIM(`Description`) = TRIM(p_Description)
          AND RegionId <> p_RegionId
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Region name already exists.' AS Message;

    ELSE

        START TRANSACTION;

        -- Store old values
        SELECT JSON_OBJECT(
            'Name', `Name`,
            'Description', `Description`,
            'IsActive', IsActive
        )
        INTO v_OldValue
        FROM regions
        WHERE RegionId = p_RegionId;

        -- Update region
        UPDATE regions
        SET
            `Name` = TRIM(p_Name),
            `Description` = TRIM(p_Description),
            UpdatedAt = NOW(),
            UpdatedBy = p_UpdatedBy,
            IsActive = p_IsActive
        WHERE RegionId = p_RegionId
          AND IsDeleted = 0;

        -- Store new values
        SET v_NewValue = JSON_OBJECT(
            'Name', TRIM(p_Name),
            'Description', TRIM(p_Description),
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
            'Updated region',
            'regions',
            p_RegionId,
            v_OldValue,
            v_NewValue,
            p_UpdatedBy
        );

        COMMIT;

        SELECT
            1 AS Success,
            'Region updated successfully.' AS Message;

    END IF;

END$$

DELIMITER ;