DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_barangays_update`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_barangays_update`(
    IN p_BarangayId INT,
    IN p_MunicipalityId INT,
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
            'Failed to update barangay.' AS Message;
    END;

    -- Check if barangay exists
    IF NOT EXISTS (
        SELECT 1
        FROM barangays
        WHERE BarangayId = p_BarangayId
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Barangay not found.' AS Message;

    -- Check duplicate barangay name (exclude current barangay)
    ELSEIF EXISTS (
        SELECT 1
        FROM barangays
        WHERE MunicipalityId = p_MunicipalityId
          AND TRIM(`Name`) = TRIM(p_Name)
          AND BarangayId <> p_BarangayId
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Barangay name already exists.' AS Message;

    ELSE

        START TRANSACTION;

        -- Store old values
        SELECT JSON_OBJECT(
            'MunicipalityId' , p_MunicipalityId,
            'Name', `Name`,
            'IsActive', IsActive
        )
        INTO v_OldValue
        FROM barangays
        WHERE BarangayId = p_BarangayId;

        -- Update barangays table
        UPDATE barangays
        SET
	    MunicipalityId = p_MunicipalityId,
            `Name` = TRIM(p_Name),
            UpdatedAt = NOW(),
            UpdatedBy = p_UpdatedBy,
            IsActive = p_IsActive
        WHERE BarangayId = p_BarangayId
          AND IsDeleted = 0;

        -- Store new values
        SET v_NewValue = JSON_OBJECT(
            'MunicipalityId', p_MunicipalityId,
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
            'Updated barangay',
            'barangays',
            p_BarangayId,
            v_OldValue,
            v_NewValue,
            p_UpdatedBy
        );

        COMMIT;

        SELECT
            1 AS Success,
            'Barangay updated successfully.' AS Message;

    END IF;

END$$

DELIMITER ;