DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_barangays_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_barangays_create`(
    IN p_MunicipalityId INT,
    IN p_Name VARCHAR(255),
    IN p_CreatedBy INT
)
BEGIN
    DECLARE v_BarangayId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to create barangay.' AS Message,
            NULL AS BarangayId;
    END;

    -- Check if barangay name already exists
    IF EXISTS (
        SELECT 1
        FROM barangays
        WHERE MunicipalityId = p_MunicipalityId
          AND TRIM(`Name`) = TRIM(p_Name)
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Barangay name already exists.' AS Message,
            NULL AS BarangayId;

    ELSE

        START TRANSACTION;

        INSERT INTO barangays (
            MunicipalityId,
            `Name`,
            CreatedBy
        )
        VALUES (
            p_MunicipalityId,
            TRIM(p_Name),
            p_CreatedBy
        );

        SET v_BarangayId = LAST_INSERT_ID();

        -- Audit Log
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
            'CREATE',
            'Created barangay',
            'barangays',
            v_BarangayId,
            NULL,
            JSON_OBJECT(
                'MunicipalityId', p_MunicipalityId,
                'Name', TRIM(p_Name),
                'CreatedBy', p_CreatedBy
            ),
            p_CreatedBy
        );

        COMMIT;

        SELECT
            1 AS Success,
            'Barangay created successfully.' AS Message,
            v_BarangayId AS BarangayId;

    END IF;

END$$

DELIMITER ;