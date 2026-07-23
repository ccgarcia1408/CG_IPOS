DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_municipalities_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_municipalities_create`(
    IN p_ProvinceId INT,
    IN p_Name VARCHAR(255),
    IN p_CreatedBy INT
)
BEGIN
    DECLARE v_MunicipalityId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to create municipality.' AS Message,
            NULL AS MunicipalityId;
    END;

    -- Check if municipality name already exists
    IF EXISTS (
        SELECT 1
        FROM municipalities
        WHERE ProvinceId = p_ProvinceId
          AND TRIM(`Name`) = TRIM(p_Name)
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Municipality name already exists.' AS Message,
            NULL AS MunicipalityId;

    ELSE

        START TRANSACTION;

        INSERT INTO municipalities (
            ProvinceId,
            `Name`,
            CreatedBy
        )
        VALUES (
            p_ProvinceId,
            TRIM(p_Name),
            p_CreatedBy
        );

        SET v_MunicipalityId = LAST_INSERT_ID();

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
            'Created municipality',
            'municipalities',
            v_MunicipalityId,
            NULL,
            JSON_OBJECT(
                'ProvinceId', p_ProvinceId,
                'Name', TRIM(p_Name),
                'CreatedBy', p_CreatedBy
            ),
            p_CreatedBy
        );

        COMMIT;

        SELECT
            1 AS Success,
            'Municipality created successfully.' AS Message,
            v_MunicipalityId AS MunicipalityId;

    END IF;

END$$

DELIMITER ;