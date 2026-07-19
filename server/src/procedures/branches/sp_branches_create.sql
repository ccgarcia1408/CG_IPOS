DELIMITER $$

USE `cg_ipos_db`$$

DROP PROCEDURE IF EXISTS `sp_branches_create`$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_branches_create`(
    IN p_Name VARCHAR(255),
    IN p_Description TEXT,
    IN p_ContactNo VARCHAR(30),
    IN p_ProvinceId INT,
    IN p_MunicipalityId INT,
    IN p_BarangayId INT,
    IN p_CreatedBy INT
)
BEGIN
    DECLARE v_BranchId INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;

        SELECT
            0 AS Success,
            'Failed to create branch.' AS Message,
            NULL AS BranchId;
    END;

    -- Check if branch name already exists
    IF EXISTS (
        SELECT 1
        FROM branches
        WHERE TRIM(NAME) = TRIM(p_Name)
          AND IsDeleted = 0
    ) THEN

        SELECT
            0 AS Success,
            'Branch name already exists.' AS Message,
            NULL AS BranchId;

    ELSE

        START TRANSACTION;

        INSERT INTO branches (
            NAME,
            Description,
            ContactNo,
            ProvinceId,
            MunicipalityId,
            BarangayId,
            IsDeleted,
            CreatedAt,
            CreatedBy,
            IsActive
        )
        VALUES (
            TRIM(p_Name),
            p_Description,
            p_ContactNo,
            p_ProvinceId,
            p_MunicipalityId,
            p_BarangayId,
            0,
            NOW(),
            p_CreatedBy,
            1
        );

        SET v_BranchId = LAST_INSERT_ID();

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
            'Created branch',
            'branches',
            v_BranchId,
            NULL,
            JSON_OBJECT(
                'Name', TRIM(p_Name),
                'Description', p_Description,
                'ContactNo', p_ContactNo,
                'ProvinceId', p_ProvinceId,
                'MunicipalityId', p_MunicipalityId,
                'BarangayId', p_BarangayId,
                'IsActive', 1
            ),
            p_CreatedBy
        );

        COMMIT;

        SELECT
            1 AS Success,
            'Branch created successfully.' AS Message,
            v_BranchId AS BranchId;

    END IF;

END$$

DELIMITER ;