DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_provinces_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_provinces_create`(
    IN p_RegionId INT,
    IN p_Name VARCHAR(255),
    IN p_CreatedBy INT
)
BEGIN
    DECLARE v_ProvinceId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to create province.' AS Message,
            NULL AS ProvinceId;
    END;

    -- Check if province name already exists
    IF EXISTS (
        SELECT 1
        FROM provinces
        WHERE RegionId = p_RegionId
          AND TRIM(`Name`) = TRIM(p_Name)
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Province name already exists.' AS Message,
            NULL AS ProvinceId;

    ELSE

        START TRANSACTION;

        INSERT INTO provinces (
            RegionId,
            `Name`,
            CreatedBy
        )
        VALUES (
            p_RegionId,
            TRIM(p_Name),
            p_CreatedBy
        );

        SET v_ProvinceId = LAST_INSERT_ID();

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
            'Created province',
            'provinces',
            v_ProvinceId,
            NULL,
            JSON_OBJECT(
                'RegionId', p_RegionId,
                'Name', TRIM(p_Name),
                'CreatedBy', p_CreatedBy
            ),
            p_CreatedBy
        );

        COMMIT;

        SELECT
            1 AS Success,
            'Province created successfully.' AS Message,
            v_ProvinceId AS ProvinceId;

    END IF;

END$$

DELIMITER ;