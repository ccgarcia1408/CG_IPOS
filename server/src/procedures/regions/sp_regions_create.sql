DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_regions_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_regions_create`(
    IN p_Name VARCHAR(255),
    IN p_Description VARCHAR(255),
    IN p_CreatedBy INT
)
BEGIN
    DECLARE v_RegionId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to create region.' AS Message,
            NULL AS RegionId;
    END;

    -- Check if region name already exists
    IF EXISTS (
        SELECT 1
        FROM regions
        WHERE TRIM(`Name`) = TRIM(p_Name)
          AND TRIM(`Description`) = TRIM(p_Description)
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Region name already exists.' AS Message,
            NULL AS RegionId;

    ELSE

        START TRANSACTION;

        INSERT INTO regions (
            `Name`,
            `Description`,
            CreatedBy
        )
        VALUES (
            TRIM(p_Name),
            TRIM(p_Description),
            p_CreatedBy
        );

        SET v_RegionId = LAST_INSERT_ID();

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
            'Created region',
            'regions',
            v_RegionId,
            NULL,
            JSON_OBJECT(
                'Name', TRIM(p_Name),
                'Description', TRIM(p_Description),
                'CreatedBy', p_CreatedBy
            ),
            p_CreatedBy
        );

        COMMIT;

        SELECT
            1 AS Success,
            'Region created successfully.' AS Message,
            v_RegionId AS RegionId;

    END IF;

END$$

DELIMITER ;