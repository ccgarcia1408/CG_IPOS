DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_municipalities_update`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_municipalities_update`(
    IN p_MunicipalityId INT,
    IN p_ProvinceId INT,
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
            'Failed to update municipality.' AS Message;
    END;

    -- Check if municipality exists
    IF NOT EXISTS (
        SELECT 1
        FROM municipalities
        WHERE MunicipalityId = p_MunicipalityId
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Municipality not found.' AS Message;

    -- Check duplicate municipality name (exclude current municipality)
    ELSEIF EXISTS (
        SELECT 1
        FROM municipalities
        WHERE ProvinceId = p_ProvinceId
          AND TRIM(`Name`) = TRIM(p_Name)
          AND MunicipalityId <> p_MunicipalityId
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Municipality name already exists.' AS Message;

    ELSE

        START TRANSACTION;

        -- Store old values
        SELECT JSON_OBJECT(
            'ProvinceId' , p_ProvinceId,
            'Name', `Name`,
            'IsActive', IsActive
        )
        INTO v_OldValue
        FROM municipalities
        WHERE MunicipalityId = p_MunicipalityId;

        -- Update municipalities table
        UPDATE municipalities
        SET
	    ProvinceId = p_ProvinceId,
            `Name` = TRIM(p_Name),
            UpdatedAt = NOW(),
            UpdatedBy = p_UpdatedBy,
            IsActive = p_IsActive
        WHERE MunicipalityId = p_MunicipalityId
          AND IsDeleted = 0;

        -- Store new values
        SET v_NewValue = JSON_OBJECT(
            'ProvinceId', p_ProvinceId,
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
            'Updated municipality',
            'municipalities',
            p_MunicipalityId,
            v_OldValue,
            v_NewValue,
            p_UpdatedBy
        );

        COMMIT;

        SELECT
            1 AS Success,
            'Municipality updated successfully.' AS Message;

    END IF;

END$$

DELIMITER ;